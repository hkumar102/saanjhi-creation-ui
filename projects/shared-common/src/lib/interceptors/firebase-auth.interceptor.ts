import { inject, Inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { onAuthStateChanged } from 'firebase/auth';
import { APP_CONFIG, AppConfig } from '../core/app-config.token';
import { Auth } from '@angular/fire/auth';

/**
 * Intercepts HTTP requests and attaches Firebase ID token (if user is logged in).
 */
@Injectable({ providedIn: 'root' })
export class FirebaseAuthInterceptor implements HttpInterceptor {

  private auth: Auth = inject(Auth);


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // const shouldIntercept = req.url.startsWith(this.config.userServiceBaseUrl);

    // if (!shouldIntercept) {
    //   return next.handle(req); // skip token injection
    // }

    // Observable that resolves to the current user token (if logged in)
    return from(
      new Promise<string | null>((resolve) => {
        const unsubscribe = onAuthStateChanged(this.auth, async (user) => {
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
