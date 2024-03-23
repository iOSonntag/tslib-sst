export * as FuncConfig from './func-config';

import { App, FunctionProps } from 'sst/constructs';
import path from 'path';


export function apply(app: App): void
{
  const isProd = app.stage === 'prod';

  app.setDefaultFunctionProps({
    // runtime: "nodejs18.x",
    timeout: 25,
    memorySize: 1024,
    logRetention: isProd ? 'one_year' : 'one_month',
    environment: {
      NODE_OPTIONS: isProd ? '' : '--enable-source-maps',
    },
    nodejs: {
      sourcemap: isProd ? false : true,
    },
    functionName: ({ functionProps, stack }) => 
    {
      if (!functionProps.handler) throw new Error('No handler defined');

      const funcName = generateFunctionPostfix(functionProps.handler);

      let name = `${app.stage}-${app.name}-${funcName}`;

      if (name.length > 64)
      {
        name = name.slice(0, 64);
      }

      return name;
    }
  });
}

export function generateName(app: App, handler: string): string
{
  const funcName = generateFunctionPostfix(handler);

  let name = `${app.stage}-${app.name}-${funcName}`;

  if (name.length > 64)
  {
    name = name.slice(0, 64);
  }

  return name;
}

/**
 * Generate a function name based on the handler path.
 * 
 * handler: packages/functions/src/v1/customers/[idOrUsername]/games/GET.handler
 * becomes: GET-v1-customers-ID-games
 */
export function generateFunctionPostfix(handler: string): string
{
  const pathObject = path.parse(handler);
  const fileName = pathObject.name;
  
  // e.g.: v1/customers/[idOrUsername]/games/GET.handler
  const relativePath = pathObject.dir.split(path.sep).slice(3).join('-');

  let name = fileName.toUpperCase();

  if (relativePath && relativePath !== '')
  {
    name = `${name}-${relativePath}`;
  }

  return replaceBracketParts(name, 'ID');
}


/**
   * Replaces all bracket parts in a route with a replacement string.
   * 
   * That includes:
   * - [SOME_VALUE]
   * - \<SOME_VALUE>
   * - {SOME_VALUE}
   * - (SOME_VALUE)
   * 
   * Example:
   * 
   * `GET-v1-customers-[idOrUsername]-games`
   * 
   * will be replaced with:
   * 
   * `GET-v1-customers-ID-games`
   */
function replaceBracketParts(route: string, replacement: string): string
{
  const parts = route.split('-');

  const newParts = parts.map((part) =>
  {
    if ((part.startsWith('[') && part.endsWith(']')) ||
        (part.startsWith('<') && part.endsWith('>')) ||
        (part.startsWith('{') && part.endsWith('}')) ||
        (part.startsWith('(') && part.endsWith(')')))
    {
      return replacement;
    }

    return part;
  });

  return newParts.join('-');
}