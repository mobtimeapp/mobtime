import { h } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';

export const qrShare = () =>
  h(
    section,
    {
      class: {
        "flex": true,
        'flex-col': true,
        'items-center': true,
        'justify-center': true,
      },
    },
    [
      h(
        'div',
        {
          class: {
            'text-md': true,
            'mb-3': true,
          },
        },
        'Scan this code to get the timer on your phone',
      ),
      h('img', {
        src: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location}`,
        class: {
          'mb-3': true,
        },
      }),
    ],
  );
