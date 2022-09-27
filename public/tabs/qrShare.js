import { h, text } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';

export const qrShare = props =>
  section(
    {
      class: {
        'flex': true,
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
        text(props.lang.share.scan),
      ),
      h('img', {
        src: props.qrImage ? props.qrImage.src : '',
        class: {
          'mb-3': true,
        },
      }),
      h('p', {}, text(props.lang.share.mobtimePoweredByWebsockets)),
      h('p', {}, text(props.lang.share.mobtimeCollaborate)),
    ],
  );
