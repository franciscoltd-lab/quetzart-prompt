import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class MessagesApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  listConversations() {
    return this.http.get<any[]>(`${this.baseUrl}/messages/conversations`);
  }

  listMessages(conversationId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/messages/conversations/${conversationId}/messages`);
  }

  sendMessage(conversationId: number, body: string) {
    return this.http.post<any>(`${this.baseUrl}/messages/conversations/${conversationId}/messages`, { body });
  }

  openSocket(conversationId: number) {
    const token = encodeURIComponent(this.auth.getToken() || '');
    const wsBase = this.baseUrl.replace(/^http/, 'ws');
    return new WebSocket(`${wsBase}/messages/ws/${conversationId}?token=${token}`);
  }
}
