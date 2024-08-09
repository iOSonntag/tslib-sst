import { Stack } from 'sst/constructs';
import { StackContext } from 'sst/constructs';

export type StackFunction<T = void> = (this: Stack, ctx: StackContext) => T | Promise<T>;


export const ZERO_UUID = '00000000-0000-0000-0000-000000000000';