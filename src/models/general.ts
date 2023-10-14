import { Stack } from 'sst/constructs';
import { StackContext } from 'sst/constructs';

export type StackFunction<T> = (this: Stack, ctx: StackContext) => T | Promise<T>;