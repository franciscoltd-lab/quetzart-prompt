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
    if (role) {
      localStorage.setItem('qz_role', role);
      this.role$.next(role);
    }
    this.token$.next(token);
  }
  logout() {
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

  loginMock(role: Role) {
    this.token$.next('mock-token');
    this.role$.next(role);
    localStorage.setItem('qz_token', 'mock-token');
    localStorage.setItem('qz_role', role);
  }

  private decodeRole(token: string): Role | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      return (payload.role as Role) || null;
    } catch {
      return null;
    }
  }
}
