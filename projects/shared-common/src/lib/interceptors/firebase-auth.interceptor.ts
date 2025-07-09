import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserContextService } from '../services/user-context.service';

/**
 * Intercepts HTTP requests and attaches Firebase ID token (if user is logged in).
 */
@Injectable({ providedIn: 'root' })
export class FirebaseAuthInterceptor implements HttpInterceptor {

  private userContextService = inject(UserContextService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.userContextService.accessToken();

    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}
