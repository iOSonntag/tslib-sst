


export * as StringUtil from './string-util';



export const transformFirstLetterToUpperCase = (str: string): string =>
{
  return str.charAt(0).toUpperCase() + str.slice(1);
}