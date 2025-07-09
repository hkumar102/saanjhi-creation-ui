import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AppEvent<T = any> {
  type: string;
  payload?: T;
}

@Injectable({ providedIn: 'root' })
export class EventEmitterService {
  // Global events subject
  events = new Subject<AppEvent>();

  emitEvent<T = any>(type: string, payload?: T) {
    this.events.next({ type, payload });
  }
}