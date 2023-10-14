import { Stack } from 'sst/constructs';
import { StackContext } from 'sst/constructs';

export type StackFunction<T = void> = (this: Stack, ctx: StackContext) => T | Promise<T>;