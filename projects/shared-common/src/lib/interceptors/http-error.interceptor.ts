import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service'

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private toast = inject(ToastService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 0) {
          this.toast.error('Unable to connect to the server.');
        } else if (err.status >= 400 && err.status < 500) {
          const detail = err.error?.message || err.statusText || 'A request error occurred.';
          this.toast.error(detail, `Error ${err.status}`);
        } else if (err.status >= 500) {
          this.toast.error('A server error occurred. Please try again later.', `Server Error ${err.status}`);
        }

        return throwError(() => err);
      })
    );
  }
}
