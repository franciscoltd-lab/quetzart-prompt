import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PublicApiService {
  baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  listArtists(search = '', page = 1, size = 20) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<any>(`${this.baseUrl}/public/artists`, { params });
  }

  listEstablishments(search = '', page = 1, size = 20) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<any>(`${this.baseUrl}/public/establishments`, { params });
  }

  listArtworks(search = '', page = 1, size = 20) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<any>(`${this.baseUrl}/public/artworks`, { params });
  }
}
