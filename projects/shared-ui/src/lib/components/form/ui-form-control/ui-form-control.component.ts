import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { UiFormErrorComponent } from '../form-error/form-error.component';
import { BaseFormControl } from '../../base-form-control';

/**
 * Hybrid form control wrapper that supports both floating labels and traditional labels.
 * Provides consistent error handling and help text across all form controls.
 * 
 * Usage Examples:
 * 
 * // Floating label
 * <saanjhi-ui-form-control 
 *   floatingLabel="Product Name *"
 *   inputId="name"
 *   [control]="form.get('name')"
 *   [errorMessages]="{ required: 'Product name is required' }">
 *   <saanjhi-ui-input inputId="name" formControlName="name"></saanjhi-ui-input>
 * </saanjhi-ui-form-control>
 * 
 * // Traditional label
 * <saanjhi-ui-form-control 
 *   label="Tags"
 *   inputId="tags"
 *   helpText="Add relevant tags to help customers find your product easily.">
 *   <saanjhi-ui-chips inputId="tags" formControlName="tags"></saanjhi-ui-chips>
 * </saanjhi-ui-form-control>
 * 
 * // No label (just error handling)
 * <saanjhi-ui-form-control [control]="form.get('agreement')">
 *   <saanjhi-ui-checkbox inputId="agreement" formControlName="agreement"></saanjhi-ui-checkbox>
 * </saanjhi-ui-form-control>
 */
@Component({
  selector: 'saanjhi-ui-form-control',
  standalone: true,
  imports: [CommonModule, FloatLabelModule, UiFormErrorComponent],
  templateUrl: './ui-form-control.component.html',
  styleUrls: ['./ui-form-control.component.scss'],
  host: {
    class: 'saanjhi-component'
  }
})
export class UiFormControlComponent extends BaseFormControl {
  /** Traditional label text (displays above the input) */
  @Input() label?: string;
  
  /** Floating label text (displays inside the input field) */
  @Input() floatingLabel?: string;
  
  /** Form control for error validation */
  @Input() control?: AbstractControl | null;
  
  /** Custom error messages for specific validation rules */
  @Input() errorMessages: { [key: string]: string } = {};
  
  /** Help text displayed below the input */
  @Input() helpText?: string;
  
  /** Additional CSS classes for the field wrapper */
  @Input() fieldClass: string = 'field';
  
  /** Whether to show errors immediately (default: false - shows on touched/dirty) */
  @Input() showErrorsImmediately: boolean = false;

  /**
   * Determines if we should show floating label
   */
  get useFloatingLabel(): boolean {
    return !!this.floatingLabel;
  }

  /**
   * Determines if we should show traditional label
   */
  get useTraditionalLabel(): boolean {
    return !!this.label && !this.floatingLabel;
  }

  /**
   * Determines if we should show error messages
   */
  get shouldShowErrors(): boolean {
    if (!this.control) return false;
    
    if (this.showErrorsImmediately) {
      return this.control.invalid;
    }
    
    return this.control.invalid && (this.control.dirty || this.control.touched);
  }
}
