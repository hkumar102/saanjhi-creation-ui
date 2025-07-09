import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { filter, map, Observable, of, take } from 'rxjs';
import { UserContextService } from '../services';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private userContext = inject(UserContextService);
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Guards routes and prevents access to unauthenticated users.
   * Redirects to '/auth/login' if the user is not logged in.
   *
   * @returns Observable<boolean | UrlTree> - true if logged in, redirect URL if not
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.authService.authReady$.pipe(
      filter(ready => ready),
      take(1),
      map(() => {
        if (this.userContext.isAuthenticated()) {
          return true;
        }
        // Save redirect URL in query param
        return this.router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url }
        });
      }));
  }
}
