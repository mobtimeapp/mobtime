import { h } from '/vendor/hyperapp.js';

/*
 * sm:col-span-1
 * sm:col-span-2
 * md:col-span-1
 * md:col-span-2
 */

export const column = (mobileSpan, breakpointSpans, children) => h(
  'div',
  {
    class: {
      [`col-span-${mobileSpan}`]: mobileSpan > 1,
      ...Object.keys(breakpointSpans).reduce((memo, breakpoint) => ({
        ...memo,
        [`${breakpoint}:col-span-${breakpointSpans[breakpoint]}`]: true,
      }), {}),
    },
  },
  children,
);

column.fixed = (span, children) => column(span, {}, children);
