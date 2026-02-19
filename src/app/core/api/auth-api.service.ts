import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginResponse {
    access_token: string;
    token_type: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
    private baseUrl = 'http://127.0.0.1:8000';

    constructor(private http: HttpClient) { }

    login(email: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, {
            email,
            password
        });
    }

    registerArtist(payload: any) {
        return this.http.post<{ access_token: string; token_type: string }>(
            `${this.baseUrl}/auth/register-artist`,
            payload
        );
    }

    registerEstablishment(payload: any) {
        return this.http.post<{ access_token: string; token_type: string }>(
            `${this.baseUrl}/auth/register-establishment`,
            payload
        );
    }

    me() {
        return this.http.get(`${this.baseUrl}/profile/me`);
    }

    getPublicArtist(id: number) {
        return this.http.get<any>(`${this.baseUrl}/public/artists/${id}`);
    }

    getPublicEstablishment(id: number) {
        return this.http.get<any>(`${this.baseUrl}/public/establishments/${id}`);
    }


}
