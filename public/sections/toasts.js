import { h, text } from '/vendor/hyperapp.js';
import { button } from '/components/button.js';
import { deleteButton } from '/components/deleteButton.js';
import { RemoveToast } from '/actions.js';
import * as effects from '/effects.js';

export const toast = ({ id, title, body, buttons }) =>
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
        text(title),
      ),
      body && h('section', {}, typeof body === 'string' ? text(body) : body),
      buttons &&
        h(
          'footer',
          {
            class: {
              'mt-2': true,
              'pt-2': true,
              'border-t': true,
              flex: true,
              'align-center': true,
              'justify-start': true,
            },
          },
          [
            ...buttons.left.map(btn =>
              button(
                {
                  class: btn.class.reduce(
                    (obj, item) => ({ ...obj, [item]: true }),
                    { 'mr-1': true },
                  ),
                  onclick: state => [
                    state,
                    ...btn.actions.map(actionProps =>
                      effects.andThen(actionProps),
                    ),
                    effects.andThen({ action: RemoveToast, props: id }),
                  ],
                },
                text(btn.text),
              ),
            ),
            h('div', { class: 'flex-grow' }),
            ...buttons.right.map(btn =>
              button(
                {
                  class: btn.class.reduce(
                    (obj, item) => ({ ...obj, [item]: true }),
                    { 'ml-1': true },
                  ),
                  onclick: state => [
                    state,
                    ...btn.actions.map(actionProps =>
                      effects.andThen(actionProps),
                    ),
                    effects.andThen({ action: RemoveToast, props: id }),
                  ],
                },
                text(btn.text),
              ),
            ),
          ],
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
