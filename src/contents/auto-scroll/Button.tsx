import ReactDOM, { Container } from 'react-dom/client';

export function Button() {
  return (
    <div>abc</div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function render(el: Container) {
  ReactDOM.createRoot(el).render(<Button />);
}
