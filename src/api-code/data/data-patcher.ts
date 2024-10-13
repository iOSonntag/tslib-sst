

export type PatchResult = {
  itemsChanged: number;
  itemsFailed: string[];
  data?: any;
};

export type DataPatch = {
  id: string;
  enabled: boolean;
  name: string;
  retryable: 'NEVER' | 'ALWAYS' | 'ON_ERROR';
  onPreConditionsMet?: () => Promise<boolean>;
  patch: (input: any) => Promise<PatchResult>;
}

