import '@webcomponents/custom-elements';

import { Shortcut } from './shortcut';

customElements.define('linux-do-shortcut', Shortcut);

const ref = new WeakMap<HTMLTextAreaElement, Shortcut>

function inject(node: Node) {
  if (node instanceof HTMLTextAreaElement) {
    const el = document.createElement('linux-do-shortcut') as Shortcut
    el.connect(node)
    ref.set(node, el)
    document.body.appendChild(el)
  }
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      inject(node)
    });
    mutation.removedNodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        const textarea = Array.from(node?.querySelectorAll?.('textarea'))
        textarea.forEach(text => {
          if (ref.has(text)) {
            ref.get(text)?.depose()
          }
        })
      }
    });
  });
});

observer.observe(document.body, {
  subtree: true,
  childList: true,
})

Array.from(document.querySelectorAll('textarea')).forEach(textarea => {
  inject(textarea)
})
