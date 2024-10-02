

export * as SSTConsole from './sst-console';



export const logIssue = (issue: any, optionalObject?: any) =>
{
  try
  {
    if (issue instanceof Error)
    {
      if (!optionalObject)
      {
        console.error(issue);
        return;
      }
  
      const finalMessage = `${issue}\n${JSON.stringify(optionalObject, null, 2)}`;
      console.error(new Error(finalMessage));
      return;
    }
  
    if (typeof issue === 'string')
    {
      if (!optionalObject)
      {
        console.error(new Error(issue));
        return;
      }
  
      const finalMessage = `${issue}\n${JSON.stringify(optionalObject, null, 2)}`;
      console.error(new Error(finalMessage));
      return;
    }

    if (!optionalObject)
    {
      console.error(new Error(JSON.stringify(issue, null, 2)));
      return;
    }

    const finalMessage = `${JSON.stringify(issue, null, 2)}\n${JSON.stringify(optionalObject, null, 2)}`;
    console.error(new Error(finalMessage));
  }
  catch (error)
  {
    console.error(new Error(`${issue}\n${optionalObject}`));
  }
}