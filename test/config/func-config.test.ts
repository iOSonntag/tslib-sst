// import { expect, test } from 'vitest';
// import { FuncConfig } from '../../src/config/func-config';


// test.each([
//   [
//     'packages/functions/src/v1/customers/[idOrUsername]/games/GET.handler', 
//     'GET-v1-customers-ID-games'
//   ],
//   [
//     'packages/functions/src/v1/customers/[idOrUsername]/games/get.handler', 
//     'GET-v1-customers-ID-games'
//   ],
//   [
//     'packages/functions/src/v1/customers/[ID]/games/GET.handler', 
//     'GET-v1-customers-ID-games'
//   ],
//   [
//     'packages/functions/src/v1/customers/[id]/games/GET.handler', 
//     'GET-v1-customers-ID-games'
//   ],
//   [
//     'packages/functions/src/v1/customers/[idOrUsername]/[otherId]/games/GET.handler', 
//     'GET-v1-customers-ID-ID-games'
//   ],
//   [
//     'packages/functions/src/v1/customers/games/GET.handler', 
//     'GET-v1-customers-games'
//   ],
//   [
//     'packages/functions/src/some-func.handler', 
//     'SOME-FUNC'
//   ],
// ])('FuncConfig.genFuncName(%s) -> %s', (value, expected) =>
// {
//   expect(FuncConfig.generateFunctionPostfix(value)).toBe(expected)
// })