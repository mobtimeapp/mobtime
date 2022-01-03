import {
  app,
  h as originalH,
  text,
} from 'https://unpkg.com/hyperapp@2.0.20?module=1';

export { app, text };
export const h = (tag, props, ...children) => {
  if (typeof tag === 'function') {
    console.warn('using h to run custom component', tag);
  }

  if (!props) {
    console.warn('h without props', { tag, children });
  }
  if (typeof children[0] === 'string') {
    console.warn('child string not wrapped in text', tag, props, children);
    return originalH(tag, props, text(children[0]));
  }
  if (Array.isArray(children) && children.some(c => typeof c === 'string')) {
    console.warn('child string not wrapped in text', tag, props, children);
  }
  return originalH(tag, props, ...children);
};
