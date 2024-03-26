
import i18next from 'i18next';
import { z } from 'zod';
import { zodI18nMap } from 'zod-i18n-map';

import de from 'zod-i18n-map/locales/de/zod.json';
import en from 'zod-i18n-map/locales/en/zod.json';

type AvailableLangeCodes = 'de' | 'en';
type LanguageMap = {
  [key in AvailableLangeCodes]: {
    zod: Record<string, any>;
  };
};

const availableLanguages: LanguageMap = {
  'de': { zod: de },
  'en': { zod: en }
};

export let zodLanguagesInitialized = false;
const fallbackLanguage: AvailableLangeCodes = 'en';


export const updateZodLanguage = (language: string) =>
{
  if (!zodLanguagesInitialized)
  {
    console.log('Initializing zod languages');

    i18next.init({
      lng: language,
      fallbackLng: fallbackLanguage,
      resources: availableLanguages,
    });

    z.setErrorMap(zodI18nMap);
    zodLanguagesInitialized = true;

    return;
  }

  i18next.changeLanguage(language);
}


