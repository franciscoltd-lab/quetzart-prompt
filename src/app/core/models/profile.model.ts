export type Role = 'artist' | 'establishment';

export interface AppProfile {
  role: Role;

  // UI
  displayName: string;
  profileImage: string | null;

  // Artista
  bio?: string;
  artisticStyle?: string;

  // Establecimiento
  category?: string;
  street?: string;
  number?: string;
  postalCode?: string;
  inferredColony?: string;
  inferredMunicipality?: string;

  // Galería / portafolio
  gallery: string[];

  // Regla: 1 cambio cada 30 días
  lastNameChangeISO: string | null;
}
