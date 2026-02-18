import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Role } from '../models/profile.model';
import { ProfileStoreService } from './profile-store.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token$ = new BehaviorSubject<string | null>(localStorage.getItem('qz_token'));
  private role$ = new BehaviorSubject<Role | null>((localStorage.getItem('qz_role') as Role) || null);

  constructor(private profileStore: ProfileStoreService) {}

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

  logout() {
    this.token$.next(null);
    this.role$.next(null);
    localStorage.removeItem('qz_token');
    localStorage.removeItem('qz_role');
    this.profileStore.clear();
  }
}
