import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, localeValues } from './locales';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requested = cookieStore.get('locale')?.value;
  const locale = localeValues.includes(requested as never) ? requested! : defaultLocale;

  return {
    locale,
    messages: (await import(`../../languages/${locale}.json`)).default,
  };
});
