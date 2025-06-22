import { Inject, Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { APP_CONFIG, AppConfig } from '../core/app-config.token';

/**
 * Intercepts HTTP requests and attaches Firebase ID token (if user is logged in).
 */
@Injectable()
export class FirebaseAuthInterceptor implements HttpInterceptor {

  /**
   *
   */
  constructor(@Inject(APP_CONFIG) private config: AppConfig) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const shouldIntercept = req.url.startsWith(this.config.userServiceBaseUrl);

    if (!shouldIntercept) {
      return next.handle(req); // skip token injection
    }

    const auth = getAuth();

    // Observable that resolves to the current user token (if logged in)
    return from(
      new Promise<string | null>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          unsubscribe();
          if (user) {
            const token = await user.getIdToken();
            resolve(token);
          } else {
            resolve(null);
          }
        });
      })
    ).pipe(
      switchMap((token) => {
        if (token) {
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
          return next.handle(cloned);
        }

        // No token? Pass through unchanged
        return next.handle(req);
      })
    );
  }
}
