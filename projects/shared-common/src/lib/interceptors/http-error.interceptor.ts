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
import { AppMessages } from '../constants';

@Injectable({ providedIn: 'root' })
export class HttpErrorInterceptor implements HttpInterceptor {
  private toast = inject(ToastService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 0) {
          this.toast.error(AppMessages.server.networkError, 'Network Error');
        } else if (err.status >= 400 && err.status < 500) {
          let detail: string;
          if (Array.isArray(err.error)) {
            detail = err.error.join('\n');
          } else if (Array.isArray(err.error?.message)) {
            detail = err.error.message.join('\n');
          } else if (err.error?.errors && typeof err.error.errors === 'object') {
            // Collect all error messages from the errors object
            detail = Object.values(err.error.errors)
              .map((messages: any) => Array.isArray(messages) ? messages.join('\n') : messages)
              .join('\n');
          } else {
            detail = err.error?.message || err.statusText || 'A request error occurred.';
          }
          this.toast.error(detail, `Error ${err.status}`);
        } else if (err.status >= 500) {
          this.toast.error(AppMessages.server.genericError, `Server Error ${err.status}`);
        }
        return throwError(() => err);
      })
    );
  }
}
