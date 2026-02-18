import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  getRandomArtworks() {
    return [
      { id: 1, title: 'Obra 1', description: 'Descripción...', price: 2500, image_url: 'https://picsum.photos/600/800?1', artist: 'Artista A' },
      { id: 2, title: 'Obra 2', description: 'Descripción...', price: 1800, image_url: 'https://picsum.photos/600/800?2', artist: 'Artista B' },
      { id: 3, title: 'Obra 3', description: 'Descripción...', price: 3200, image_url: 'https://picsum.photos/600/800?3', artist: 'Artista C' },
    ];
  }

  getRandomEstablishments() {
    return [
      { id: 10, name: 'Café Aurora', category: 'Cafetería', image_url: 'https://picsum.photos/900/600?10', lat: 20.6767, lng: -103.3476 },
      { id: 11, name: 'Bistró Nube', category: 'Restaurante', image_url: 'https://picsum.photos/900/600?11', lat: 20.6736, lng: -103.3440 },
    ];
  }

  getArtistsList() {
    return [
      { id: 1, name: 'Artista A', avatar: 'https://i.pravatar.cc/120?img=12' },
      { id: 2, name: 'Artista B', avatar: 'https://i.pravatar.cc/120?img=22' },
      { id: 3, name: 'Artista C', avatar: 'https://i.pravatar.cc/120?img=32' },
    ];
  }

  getEstablishmentsList() {
    return this.getRandomEstablishments().map(e => ({
      id: e.id, name: e.name, category: e.category, avatar: `https://i.pravatar.cc/120?u=${e.id}`
    }));
  }
}
