import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth';

/**
 * Intercepts HTTP requests and attaches Firebase ID token (if user is logged in).
 */
@Injectable({ providedIn: 'root' })
export class FirebaseAuthInterceptor implements HttpInterceptor {

  private readonly authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return next.handle(req);
    }
    return from(user.getIdToken()).pipe(
      switchMap(token => {
        if (token) {
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
          return next.handle(cloned);
        }
        return next.handle(req);
      })
    );
  }
}
