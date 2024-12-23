import { extname } from 'node:path';
import type { Plugin } from 'vite';
import _ from 'lodash';
import Manifest from '../manifest.json';
import { cleanArray, resolveEntries } from '../lib/utils';

export {resolveEntries}

export function ChromeExtensionManifestPlugin(): Plugin {
  const manifest: chrome.runtime.ManifestV3 = JSON.parse(JSON.stringify(Manifest));

  if (process.env.EXTENSION_RELEASE_VERSION) {
    manifest.version = process.env.EXTENSION_RELEASE_VERSION;
  }

  return {
    name: 'vite-plugin-chrome-extension-manifest',

    enforce: 'post',

    generateBundle(__, bundle) {
      const icons = [];
      const entries = resolveEntries();

      for (const file in bundle) {
        const chunk = bundle[file];
        if (chunk.type === 'chunk' && chunk.isEntry) {
          const { facadeModuleId, name } = chunk;
          const entry = entries.find(item => item.path === facadeModuleId);
          if (entry) {
            _.set(manifest, entry.key, extname(facadeModuleId) === '.html' ? `${name}.html` : `${name}.js`);
            if (entry.key.startsWith('content_scripts')) {
              chunk.code = `(async function(){${chunk.code.replace(/import\s*{([^}]+)}\s*from\s*["']([^"']+)["']/g, (match, imports, modulePath) => {
                return imports.split(',').map((importStatement: string) => {
                  const [importName, aliasName] = importStatement.trim().split(/\s+as\s+/);
                  const alias = aliasName ? aliasName : importName;
                  return `const ${alias} = await import("${modulePath}").then(m => m.${importName});`;
                }).join('\n')
              }).replace(/import\s*["']([^"']+)["'];?/g, (match: unknown, modulePath: string) => {
                return `await import("${modulePath}");`;
              })}})()`
            }
            if (entry.withCss) {
              _.set(manifest, entry.key.replace('js', 'css'), chunk.viteMetadata.importedCss.values().next().value);
            }
          }
        } else if (chunk.type === 'asset' && typeof chunk.fileName === 'string' && chunk.fileName.startsWith('icons/')) {
          icons.push(chunk.fileName);
        }
      }

      _.set(manifest, 'web_accessible_resources.0.resources',
        _.get(manifest, 'web_accessible_resources.0.resources', []).concat(['assets/*']));

      manifest.icons = icons.reduce<Record<string, string>>((acc, item) => {
        const match = /icons\/icon(.+)\.png$/.exec(item);
        if (match) {
          acc[match[1]] = item;
        }
        return acc;
      }, {});

      if (manifest.action) {
        manifest.action.default_icon = manifest.icons['16'];
      }

      cleanArray(manifest)

      this.emitFile({
        fileName: 'manifest.json',
        type: 'asset',
        source: JSON.stringify(manifest, null, 2),
      });

      const contentScripts = _.get(manifest, 'web_accessible_resources', [])
        .map((d: { resources: string[]; }) => d.resources).flat();

      contentScripts.forEach((file: string) => {
        Reflect.deleteProperty(bundle, file);
      });
    },
  };
}
