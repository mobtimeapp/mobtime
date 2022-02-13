import { overlay } from '/components/overlay.js';
import { card } from '/components/card.js';

export const modal = (
  { cardClass, class: overlayClass, ...overlayProps },
  children,
) =>
  overlay(
    {
      ...overlayProps,
      class: {
        'pt-12': true,
        'bg-gray-800': true,
        'dark:bg-gray-100': true,
        'bg-opacity-25': true,
        'dark:bg-opacity-25': true,
        ...(overlayClass || {}),
      },
    },
    [
      card(
        {
          class: {
            'bg-white': true,
            'dark:bg-gray-800': true,
            'px-2': true,
            'max-w-full': true,
            ...(cardClass || {}),
          },
        },
        children,
      ),
    ],
  );
