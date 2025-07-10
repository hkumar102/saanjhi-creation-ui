import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { BaseFormControl } from '../base-form-control';

/**
 * Standalone UI Button wrapper around PrimeNG <p-button>.
 * Use to keep UI framework swappable.
 */
@Component({
  selector: 'saanjhi-ui-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <p-button 
      [type]="type"
      [label]="label"
      [icon]="icon"
      [iconPos]="iconPos"
      [disabled]="disabled"
      [loading]="loading"
      [severity]="severity"
      [size]="size"
      [outlined]="outlined"
      [rounded]="rounded"
      [text]="text"
      [raised]="raised"
      [plain]="plain"
      [badge]="badge"
      [badgeClass]="badgeClass"
      [styleClass]="styleClass"
      (onClick)="onClick.emit($event)">
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

  /** Icon position */
  @Input() iconPos: 'left' | 'right' | 'top' | 'bottom' = 'left';

  /** Button size */
  @Input() size: 'small' | 'large' | undefined = undefined;

  /** Whether the button is outlined */
  @Input() outlined: boolean = false;

  /** Whether the button is text-only */
  @Input() text: boolean = false;

  /** Whether the button is plain */
  @Input() plain: boolean = false;

  /** Badge content */
  @Input() badge: string = '';

  /** Badge CSS class */
  @Input() badgeClass: string = '';

  handleClick(event: Event) {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }
}
