import ReactDOM from 'react-dom/client';
import {
  createTheme,
  ThemeProvider
} from "@mui/material/styles";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

import { Dropdown } from './Dropdown'

export class Shortcut extends HTMLElement {
  static observedAttributes = ["left", "top"];

  private textarea?: HTMLTextAreaElement;
  private resizeObserver?: ResizeObserver;

  constructor() {
    super();
  }

  connect( textarea: HTMLTextAreaElement) {
    this.textarea = textarea;
    (this.textarea as unknown as { __linux_do_shortcut__: Shortcut }).__linux_do_shortcut__ = this
    this.resizeObserver = new ResizeObserver(this.adjustPosition)
    this.resizeObserver.observe(this.textarea)
  }

  connectedCallback() {
    const mountPoint = document.createElement('div');
    mountPoint.setAttribute('style', 'position: fixed; top: -1000px; left: -1000px; z-index: 9999999; transform: translate3d(0, -50%, 0);');
    this.attachShadow({ mode: 'open' }).appendChild(mountPoint);

    const cache = createCache({
      key: 'css',
      prepend: true,
      container: mountPoint,
    });

    const root = ReactDOM.createRoot(mountPoint);

    const shadowTheme = createTheme({
      typography: {
        fontSize: 12,
      },
      spacing: 2,
      components: {
        MuiPopover: {
          defaultProps: {
            container: mountPoint
          }
        },
        MuiPopper: {
          defaultProps: {
            container: mountPoint
          }
        },
        MuiModal: {
          defaultProps: {
            container: mountPoint
          }
        }
      }
    });

    root.render(<CacheProvider value={cache}>
      <ThemeProvider theme={shadowTheme}>
        <Dropdown
          container={mountPoint}
          onSelect={this.handleInsert}
        />
      </ThemeProvider>
    </CacheProvider>);
  }

  handleInsert = (content: string) => {
    if (!this.textarea) return;
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const value = this.textarea.value;
    this.textarea.value = value.substring(0, start) + content + value.substring(end);
    this.textarea.selectionStart = this.textarea.selectionEnd = start + content.length;
    const event = new Event('change')
    this.textarea.dispatchEvent(event)
    this.textarea.focus();
  }

  // @ts-expect-error nothing
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    const root: HTMLElement = this?.shadowRoot?.firstChild as HTMLElement
    if (!root) {
      return
    }
    if (name === 'left') {
     root.style.left = newValue
    }
    if (name === 'top') {
      root.style.top = newValue
    }
  }

  adjustPosition = (entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    const { height } = entry.contentRect;
    const { top, left } = entry.target.getBoundingClientRect();
    const iconTop = top + height / 2
    const iconLeft = left
    this.setAttribute('top', `${iconTop}px`)
    this.setAttribute('left', `${iconLeft}px`)
  }

  depose() {
    this.textarea = undefined
    this.resizeObserver?.disconnect()
    this.resizeObserver = undefined
    this.remove()
  }
}
