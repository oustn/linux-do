import '@webcomponents/custom-elements';

import { Shortcut } from './shortcut';

customElements.define('linux-do-shortcut', Shortcut);

const el = document.createElement('linux-do-shortcut')
el.setAttribute('name', 'Linux-Do')
document.body.appendChild(el)
