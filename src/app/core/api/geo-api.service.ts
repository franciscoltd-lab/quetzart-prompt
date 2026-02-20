// src/app/core/api/geo-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

export interface PostalCodeInfo {
  postal_code: string;
  colonies: string[];
  municipality: string;
  state: string;
}

@Injectable({ providedIn: 'root' })
export class GeoApiService {
  private baseUrl = 'https://sepomex.icalialabs.com/api/v1';

  constructor(private http: HttpClient) {}

  getPostalCodeInfo(cp: string): Observable<PostalCodeInfo> {
    // per_page alto por si el CP tiene varias colonias
    const url = `${this.baseUrl}/zip_codes?zip_code=${cp}&per_page=100`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const list: any[] = Array.isArray(res?.zip_codes) ? res.zip_codes : [];

        if (!list.length) {
          const e: any = new Error('Código postal no encontrado');
          e.status = 404;
          throw e;
        }

        const coloniesSet = new Set<string>();
        let municipality = '';
        let state = '';

        for (const item of list) {
          // colonia
          if (item.d_asenta) {
            coloniesSet.add(item.d_asenta);
          }

          // municipio / estado (son iguales para todos los registros del mismo CP)
          if (!municipality && item.d_mnpio) {
            municipality = item.d_mnpio;
          }
          if (!state && item.d_estado) {
            state = item.d_estado;
          }
        }

        const colonies = Array.from(coloniesSet);

        return {
          postal_code: cp,
          colonies,
          municipality,
          state,
        } as PostalCodeInfo;
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }
}