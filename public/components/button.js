import { h } from '/vendor/hyperapp.js';

const sizes = {
  sm: 'px-1',
  md: 'py-1 px-2',
  lg: 'py-2 px-4',
};

const classToObject = myClass => {
  if (typeof myClass === 'string') return classToObject(myClass.split(' '));
  if (Array.isArray(myClass)) {
    return myClass
      .filter(str => str)
      .reduce((obj, str) => ({ ...obj, [str]: true }), {});
  }
  return myClass;
};

const combineClass = (...classes) =>
  classes
    .filter(c => c)
    .reduce(
      (memo, currentClass) => ({
        ...memo,
        ...classToObject(currentClass),
      }),
      {},
    );

const buttonColorClasses = (bgColorBase, textColor, transparent) => [
  'transition-all',
  transparent
    ? 'bg-opacity-0 hover:bg-opacity-50 dark:bg-opacity-0 dark:hover:bg-opacity-50'
    : 'bg-opacity-50 dark:bg-opacity-50 hover:bg-opacity-100 dark:hover:bg-opacity-100',
  `bg-${bgColorBase}-200 dark:bg-${bgColorBase}-800`,
  textColor ? `text-${textColor}` : 'text-gray-800 dark:text-gray-200',
];

export const button = (props = {}, children) =>
  h(
    'button',
    {
      type: 'button',
      ...props,
      class: combineClass(
        sizes[props.size] || sizes.lg,
        props.class,
        buttonColorClasses(
          props.color || 'gray',
          props.textColor,
          !!props.transparent,
        ),
      ),
    },
    [].concat(children),
  );
