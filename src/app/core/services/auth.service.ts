import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Role = 'artist' | 'establishment' | null;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token$ = new BehaviorSubject<string | null>(null);
  private role$ = new BehaviorSubject<Role>(null);

  isLoggedIn() { return !!this.token$.value; }
  getRole(): Role { return this.role$.value; }

  // Mock login (por ahora)
  mockLogin(role: Exclude<Role, null>) {
    this.token$.next('mock-token');
    this.role$.next(role);
  }

  logout() {
    this.token$.next(null);
    this.role$.next(null);
  }
}
