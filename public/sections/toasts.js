import { h, text } from '/vendor/hyperapp.js';
import { deleteButton } from '/components/deleteButton.js';
import { RemoveToast } from '/actions.js';

export const toast = ({ id, title, body, footer }) =>
  h(
    'article',
    {
      class:
        'relative rounded p-2 border bg-indigo-600 text-white hover:shadow hover:-translate-x-4 transition-all mb-2 w-full',
    },
    [
      h(
        'header',
        {
          class: 'font-bold mr-16',
        },
        title,
      ),
      body && h('section', {}, body),
      footer &&
        h(
          'footer',
          {
            class: {
              'mt-2': true,
              'pt-2': true,
              'border-t': true,
            },
          },
          footer,
        ),
      h(
        'div',
        {
          class: 'absolute top-0 right-0',
        },
        deleteButton({
          onclick: () => [RemoveToast, id],
        }),
      ),
    ],
  );

export const toasts = props =>
  h(
    'div',
    {
      class:
        'absolute top-0 right-0 sm:right-20 pt-2 mx-2 flex flex-col align-center justify-end',
      style: {
        'max-height': '50vh',
        width: '300px',
      },
    },
    [...props.toasts.map(toast)],
  );
