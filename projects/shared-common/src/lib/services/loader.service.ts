import { Injectable, signal } from '@angular/core';

/**
 * Service to control global loading indicator (page spinner).
 */
@Injectable({ providedIn: 'root' })
export class UiLoaderService {
  private activeRequests = signal(0);

  readonly isLoading = this.activeRequests.asReadonly();

  show() {
    this.activeRequests.update(count => count + 1);
  }

  hide() {
    this.activeRequests.update(count => Math.max(count - 1, 0));
  }

  reset() {
    this.activeRequests.set(0);
  }
}
