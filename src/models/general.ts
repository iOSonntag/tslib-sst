
export type StackFunction<T = void> = (this: any/*Stack*/, ctx: any/*StackContext*/) => T | Promise<T>;

// TODO: remove this file


export const ZERO_UUID = '00000000-0000-0000-0000-000000000000';