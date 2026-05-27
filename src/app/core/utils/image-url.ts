import { environment } from 'src/environments/environment.prod';

const mediaPath = '/media/';

export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const trimmed = String(url).trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('data:') || trimmed.startsWith('assets/')) {
    return trimmed;
  }

  const mediaIndex = trimmed.indexOf(mediaPath);
  if (mediaIndex >= 0) {
    const fileName = trimmed.slice(mediaIndex + mediaPath.length).replace(/^\/+/, '');
    return `${environment.apiUrl}${mediaPath}${fileName}`;
  }

  if (trimmed.startsWith('media/')) {
    return `${environment.apiUrl}/${trimmed}`;
  }

  if (trimmed.startsWith('/media/')) {
    return `${environment.apiUrl}${trimmed}`;
  }

  return trimmed;
}
