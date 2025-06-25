import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserContextService } from '../services';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: UserContextService,
    private router: Router
  ) { }

  /**
   * Guards routes and prevents access to unauthenticated users.
   * Redirects to '/auth/login' if the user is not logged in.
   *
   * @returns Observable<boolean | UrlTree> - true if logged in, redirect URL if not
   */
  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated() ? of(true) : of(this.router.parseUrl('/login'))
  }
}
