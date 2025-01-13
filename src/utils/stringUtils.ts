/**
 * Capitalize the first letter in a text
 * @param text Input text
 */
export const upperFirst = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};
