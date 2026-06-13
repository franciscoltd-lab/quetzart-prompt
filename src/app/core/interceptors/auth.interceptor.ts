import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.auth.getToken();
    const payload = this.auth.getTokenPayload();
    console.debug('[qz_http_auth_interceptor]', {
      method: req.method,
      url: req.url,
      hasToken: !!token,
      sub: payload?.sub ?? null,
      role: payload?.role ?? null,
    });

    if (!token) {
      return next.handle(req); // público
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(authReq);
  }
}
