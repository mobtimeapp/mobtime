import { h, text } from '/vendor/hyperapp.js';
import { timerSettings } from '/sections/timerSettings.js';
import * as actions from '/actions.js';

export const drawer = (props) => {
  return h('aside', {
    class: [
      'absolute',
      'right-0',
      'top-0',
      'h-screen',
      'w-3/4',
      'sm:w-1/2',
      'md:w-1/4',
      'bg-white',
      'dark:bg-gray-700',
      'overflow-y-hidden',
      'shadow-xl',
      'flex',
      'flex-col',
      'justify-start',
      'items-start',
    ],
    open: true,
  }, [
    h('header', { class: 'my-2 px-2 w-full flex justify-between items-start' }, [
      h('h1', { class: 'text-lg' }, text('Timer Configuration')),

      h('button', {
        type: 'button',
        innerHTML: '&times;',
        onclick: [actions.ToggleDrawer, { showDrawer: false }],
      }),
    ]),

    h('details', { class: 'm-2' }, [
      h('summary', {}, text('Timer Settings')),
      h('p', {}, text('These settings live in local storage, and are your personal preferences')),
      timerSettings(props),
    ]),
    h('details', { class: 'm-2' }, [
      h('summary', {}, text('Local Settings')),
      h('p', {}, text('These settings live in local storage, and are your personal preferences')),
    ]),
    h('details', { class: 'm-2' }, [
      h('summary', {}, text('Shareable QR Code')),
      h('img', {
        src: props.qrImage ? props.qrImage.src : '',
        class: {
          'mb-3': true,
        },
      }),
      h('p', {}, h('small', {}, text(props.lang.share.mobtimePoweredByWebsockets))),
      h('p', {}, h('small', {}, text(props.lang.share.mobtimeCollaborate))),
    ]),

  ]);
};
