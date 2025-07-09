import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { BaseFormControl } from '../base-form-control';

/**
 * Standalone UI Button wrapper around PrimeNG <p-button>.
 * Use to keep UI framework swappable.
 */
@Component({
  selector: 'saanjhi-ui-button',
  standalone: true,
  imports: [ButtonModule],
  template: `
  <p-button
      [type]="type"
      [label]="label"
      [icon]="icon"
      [loading]="loading"
      [disabled]="disabled || loading"
      [styleClass]="styleClass"
      (click)="handleClick($event)"
      [attr.id]="id" class="w-full"
      [severity]="severity"
      [rounded]="rounded"
      [raised]="raised"
      >
      <ng-content></ng-content>
    </p-button>
  `,
  host: {
    class: 'saanjhi-component'
  }
})
export class UiButtonComponent extends BaseFormControl {
  /** Text label of the button */
  @Input() label: string = '';

  /** Icon class (e.g., 'pi pi-check') */
  @Input() icon: string = '';

  /** Button type (submit, button, etc.) */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /** Button styleClass (e.g., 'p-button-primary') */
  @Input() styleClass?: string;

  /** Whether the button is disabled */
  @Input() disabled = false;

  /** Whether the button is in a loading state */
  @Input() loading = false;

  @Input() rounded = false;
  @Input() raised = false;

  @Input() severity: ButtonSeverity = 'primary';

  /** Emits click event */
  @Output() onClick = new EventEmitter<Event>();

  handleClick(event: Event) {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }
}
