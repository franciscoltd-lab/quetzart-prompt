import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Role } from '../models/profile.model';
import { ProfileStoreService } from './profile-store.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token$ = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  private role$ = new BehaviorSubject<Role | null>((localStorage.getItem('qz_role') as Role) || null);

  constructor(private profileStore: ProfileStoreService) { }

  login(token: string) {
    localStorage.setItem('token', token);
    const role = this.decodeRole(token);
    const payload = this.decodePayload(token);
    console.debug('[qz_auth_front_login]', {
      sub: payload?.sub ?? null,
      role: payload?.role ?? role,
      exp: payload?.exp ?? null,
    });
    if (role) {
      localStorage.setItem('qz_role', role);
      this.role$.next(role);
    }
    this.token$.next(token);
  }
  logout() {
    const payload = this.decodePayload(this.token$.value);
    console.debug('[qz_auth_front_logout]', {
      sub: payload?.sub ?? null,
      role: payload?.role ?? this.role$.value,
    });
    localStorage.removeItem('token');
    localStorage.removeItem('qz_role');
    this.token$.next(null);
    this.role$.next(null);
    this.profileStore.clear();
  }

  getToken() {
    return this.token$.value;
  }

  isLoggedIn() {
    return !!this.token$.value;
  }
  getRole(): Role | null {
    return this.role$.value;
  }

  getTokenPayload(): any | null {
    return this.decodePayload(this.token$.value);
  }

  loginMock(role: Role) {
    this.token$.next('mock-token');
    this.role$.next(role);
    localStorage.setItem('qz_token', 'mock-token');
    localStorage.setItem('qz_role', role);
  }

  private decodeRole(token: string): Role | null {
    const payload = this.decodePayload(token);
    return (payload?.role as Role) || null;
  }

  private decodePayload(token: string | null): any | null {
    try {
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1] || ''));
    } catch {
      return null;
    }
  }
}
