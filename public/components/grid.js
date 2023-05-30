import { h } from '/vendor/hyperapp.js';

export const grid = (children) => h('div', { class: 'grid px-2 md:px-0 grid-cols-1 md:grid-cols-2 container mx-auto gap-8' }, children);
