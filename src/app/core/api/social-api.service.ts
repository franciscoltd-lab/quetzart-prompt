import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class SocialApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  favoriteStatus(artworkId: number) {
    return this.http.get<any>(`${this.baseUrl}/social/favorites/${artworkId}`);
  }

  addFavorite(artworkId: number) {
    return this.http.post<any>(`${this.baseUrl}/social/favorites/${artworkId}`, {});
  }

  removeFavorite(artworkId: number) {
    return this.http.delete<any>(`${this.baseUrl}/social/favorites/${artworkId}`);
  }

  createPurchaseIntent(artworkId: number) {
    return this.http.post<any>(`${this.baseUrl}/social/purchases/${artworkId}`, {});
  }
}
