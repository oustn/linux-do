export function avatarUrl(template: string, size: number = 96) {
  return template.replace(/^\//, 'https://cdn.linux.do/')
    .replace('{size}', size.toString());
}
