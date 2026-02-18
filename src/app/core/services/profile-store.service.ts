import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppProfile } from '../models/profile.model';

const LS_KEY = 'qz_profile_v1';

@Injectable({ providedIn: 'root' })
export class ProfileStoreService {
  private readonly _profile$ = new BehaviorSubject<AppProfile | null>(this.load());
  readonly profile$ = this._profile$.asObservable();

  get snapshot(): AppProfile | null {
    return this._profile$.value;
  }

  setProfile(profile: AppProfile) {
    this._profile$.next(profile);
    this.save(profile);
  }

  patchProfile(patch: Partial<AppProfile>) {
    const current = this._profile$.value;
    if (!current) return;
    const next: AppProfile = { ...current, ...patch };
    this._profile$.next(next);
    this.save(next);
  }

  clear() {
    this._profile$.next(null);
    localStorage.removeItem(LS_KEY);
  }

  private save(profile: AppProfile) {
    localStorage.setItem(LS_KEY, JSON.stringify(profile));
  }

  private load(): AppProfile | null {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as AppProfile) : null;
    } catch {
      return null;
    }
  }
}
