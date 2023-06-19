export const formData = (formElement) => {
  const formData = new FormData(formElement);
  return Array.from(formData.keys()).reduce((obj, key) => ({ ...obj, [key]: formData.get(key) }), {});
};
