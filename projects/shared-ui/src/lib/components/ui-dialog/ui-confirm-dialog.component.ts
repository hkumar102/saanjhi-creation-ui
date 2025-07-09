import { Component, inject } from '@angular/core';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'saanjhi-ui-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  template: `<p-confirmDialog></p-confirmDialog>`
})
export class UiConfirmDialogComponent {
  private readonly confirmationService = inject(ConfirmationService);

  open(options: {
    message: string;
    header?: string;
    icon?: string;
    accept: () => void;
    reject?: () => void;
  }) {
    this.confirmationService.confirm({
      header: options.header ?? 'Confirm',
      icon: options.icon ?? 'pi pi-exclamation-triangle',
      message: options.message,
      accept: options.accept,
      reject: options.reject
    });
  }
}