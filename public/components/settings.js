import { h } from 'https://unpkg.com/hyperapp?module=1';

import * as actions from '/actions.js';

const formToJson = (formElement) => {
  const formData = new FormData(formElement);
  return Array.from(formData.keys())
    .reduce((json, key) => ({
      ...json,
      [key]: formData.get(key),
    }), {});
};

const formDecoder = (e) => {
  e.preventDefault();
  return formToJson(e.target);
};

export const settings = (props, children) => h('form', {
  ...props,
  action: '/api/settings',
  method: 'post',
  onsubmit: [
    actions.UpdateSettings,
    formDecoder,
  ],
}, children);
