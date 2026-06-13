import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface AppVersionInfo {
  minimum_supported_version: string;
  latest_version: string;
}

@Injectable({ providedIn: 'root' })
export class AppVersionApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getVersionInfo() {
    return this.http.get<AppVersionInfo>(`${this.baseUrl}/app/version`);
  }
}
