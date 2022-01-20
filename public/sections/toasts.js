import { h, text } from '/vendor/hyperapp.js';
import { button } from '/components/button.js';
import { deleteButton } from '/components/deleteButton.js';

export const toast = ({ title, body, footer }) =>
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
        deleteButton({}),
      ),
    ],
  );

export const toasts = () =>
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
    [
      toast({
        title: text('Sound Effects'),
        body: text(
          'You previously enabled sound effects, do you want to enable this time, too?',
        ),
        footer: h(
          'div',
          {
            class: 'flex align-center justify-start',
          },
          [
            button(
              {
                class: {
                  'bg-green-600': true,
                  'text-white': true,
                  'mr-1': true,
                  uppercase: false,
                },
              },
              text('Okay!'),
            ),
            button(
              {
                class: {
                  'bg-slate-200': true,
                  'text-gray-900': true,
                  'mr-1': true,
                  uppercase: false,
                },
              },
              text('Not now'),
            ),
            h('div', { class: 'flex-grow' }),
            button(
              {
                class: {
                  'bg-red-600': true,
                  'text-white': true,
                  'mr-1': true,
                  uppercase: false,
                },
              },
              text('Never'),
            ),
          ],
        ),
      }),
      toast({
        title: text('Bot Integration'),
        body: text(
          'Someone started syncing vehikl/repo issues with your goals',
        ),
      }),
    ],
  );
