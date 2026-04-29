export function cn(...classes: (string | undefined | null | boolean | Record<string, boolean>)[]) {
  return classes
    .flatMap((c) => {
      if (typeof c === 'object' && c !== null) {
        return Object.entries(c)
          .filter(([_, value]) => value)
          .map(([key]) => key);
      }
      return c;
    })
    .filter(Boolean)
    .join(' ');
}

export function getMediaUrl(url: string | null | undefined) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/api')) return url;
  
  // If it's a UUID, it's a media ID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(url);
  if (isUuid) return `/api/v1/media/${url}`;
  
  if (url.startsWith('/')) return `/api${url}`;
  return `/api/${url}`;
}
