import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Wrapper service for PrimeNG MessageService.
 * Provides simplified methods for showing toast messages.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private messageService: MessageService) {}

  success(detail: string, summary: string = 'Success', life = 3000) {
    this.messageService.add({ severity: 'success', summary, detail, life, key: 'global' });
  }

  error(detail: string, summary: string = 'Error', life = 5000) {
    this.messageService.add({ severity: 'error', summary, detail, life, key: 'global' });
  }

  info(detail: string, summary: string = 'Info', life = 4000) {
    this.messageService.add({ severity: 'info', summary, detail, life, key: 'global' });
  }

  warn(detail: string, summary: string = 'Warning', life = 4000) {
    this.messageService.add({ severity: 'warn', summary, detail, life, key: 'global' });
  }

  clear(key: string = 'global') {
    this.messageService.clear(key);
  }
}
