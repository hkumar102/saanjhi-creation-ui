import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { BaseFormControl } from '../base-form-control';

/**
 * Wrapper around PrimeNG's p-checkbox.
 * Supports ngModel and reactive forms.
 */
@Component({
  selector: 'saanjhi-ui-checkbox',
  standalone: true,
  imports: [CommonModule, CheckboxModule, FormsModule],
  templateUrl: './ui-checkbox.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: UiCheckboxComponent
    }
  ],
  host: {
    class: 'saanjhi-component'
  }
})
export class UiCheckboxComponent extends BaseFormControl implements ControlValueAccessor {
  @Input() label = '';
  @Input() disabled = false;

  value: boolean = false;

  onChange = (val: boolean) => {};
  onTouched = () => {};

  writeValue(val: boolean): void {
    this.value = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
