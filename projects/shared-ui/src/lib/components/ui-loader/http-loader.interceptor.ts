import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { UiLoaderService } from './loader.service';

/**
 * Automatically toggles global loader during HTTP requests.
 */
@Injectable()
export class HttpLoaderInterceptor implements HttpInterceptor {
  private loader = inject(UiLoaderService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loader.show();
    return next.handle(req).pipe(
      finalize(() => this.loader.hide())
    );
  }
}
