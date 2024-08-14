import ReactDOM from 'react-dom/client';

import { Dropdown } from './Dropdown'

export class Shortcut extends HTMLElement {
  connectedCallback() {
    const mountPoint = document.createElement('div');
    this.attachShadow({ mode: 'open' }).appendChild(mountPoint);

    const root = ReactDOM.createRoot(mountPoint);
    root.render(<Dropdown/>);
  }
}
