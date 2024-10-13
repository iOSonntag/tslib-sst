


export * as PatchHelper from './patch-helper';



const BATCH_SIZE = 100;

/**
 * Returns a list of failed items.
 */
export const patchBatch = async <T>(items: T[], retryPatch: boolean, patch: (item: T) => Promise<void>): Promise<T[]> =>
{
  // check if items are larger than BATCH_SIZE, if so, split the array into one chunk
  // of BATCH_SIZE and the rest and do a recursive call
  if (items.length > BATCH_SIZE)
  {
    const firstBatch = items.slice(0, BATCH_SIZE);
    const rest = items.slice(BATCH_SIZE);

    const failedItemInners = await patchBatch(firstBatch, retryPatch, patch);

    await new Promise((resolve) => setTimeout(resolve, 100));

    return failedItemInners.concat(await patchBatch(rest, retryPatch, patch));
  }

  const failedItems: T[] = [];
  const promises: Promise<T | null>[] = [];

  for (const fiItem of items)
  {
    promises.push(patchSingle(fiItem, retryPatch, patch));
    await new Promise((resolve) => setTimeout(resolve, 1));
  }

  const results = await Promise.all(promises);


  for (let i = 0; i < results.length; i++)
  {
    if (results[i] !== null)
    {
      failedItems.push(results[i]!);
    }
  }

  return failedItems;
}

const patchSingle = async <T>(item: T, retryPatch: boolean, patch: (item: T) => Promise<void>): Promise<T | null> =>
{
  for (let i = 0; i < 5; i++)
  {
    try
    {
      await patch(item);

      return null;
    }
    catch (e)
    {
      if (!retryPatch)
      {
        return item;
      }

      // 500 ms timeout
      await new Promise((resolve) => setTimeout(resolve, 100 + i * 200));
    }
  }

  return item;
}