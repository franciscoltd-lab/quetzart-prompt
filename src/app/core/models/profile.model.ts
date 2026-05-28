export type Role = 'artist' | 'establishment';

export type GalleryItem = {
  id: number;
  url: string;
  title?: string | null;
  size?: string | null;
  technique?: string | null;
  price?: string | number | null;
  description?: string | null;
};

export interface AppProfile {
  role: 'artist' | 'establishment';
  displayName: string;
  profileImage: string | null;
  lastNameChangeISO: string | null;

  artisticStyle?: string | null;
  bio?: string | null;

  category?: string | null;
  street?: string;
  number?: string;
  postalCode?: string;
  inferredColony?: string;
  inferredMunicipality?: string;

  gallery: GalleryItem[]; // 👈 antes era string[]
}
