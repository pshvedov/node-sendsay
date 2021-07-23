import { URLSearchParams } from 'url';

export function createSearchParamsFromObject(data: Record<string, unknown>): URLSearchParams {
  const searchParams = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        searchParams.append(key, String(item));
      });
    } else {
      searchParams.set(key, String(value));
    }
  });
  return searchParams;
}
