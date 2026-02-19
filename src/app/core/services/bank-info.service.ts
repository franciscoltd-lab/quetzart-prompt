// bank-info.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

export interface BankInfo {
  bank: string;
  account: string;
  clabe: string;
}

@Injectable({ providedIn: 'root' })
export class BankInfoService {
  // usa environment para no hardcodear
  private baseUrl = environment.apiUrl; // mejor: environment.apiUrl

  constructor(private http: HttpClient) {}

  getBankInfo(): Observable<BankInfo> {
    return this.http.get<BankInfo>(`${this.baseUrl}/public/bank-info`);
  }
}
