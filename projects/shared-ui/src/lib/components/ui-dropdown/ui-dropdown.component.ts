import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseFormControl } from '../base-form-control';

/**
 * Wrapper around PrimeNG's p-dropdown.
 * Supports ngModel and reactive forms.
 */
@Component({
  selector: 'saanjhi-ui-dropdown',
  standalone: true,
  imports: [CommonModule, SelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ui-dropdown.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => UiDropdownComponent),
    }
  ],
  host: {
    class: 'saanjhi-component'
  }
})
export class UiDropdownComponent extends BaseFormControl implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'id';
  @Input() placeholder = 'Select';
  @Input() disabled = false;

  value: any;

  onChange = (_: any) => { };
  onTouched = () => { };

  writeValue(value: any): void {
    this.value = value;
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

  onValueChange(event: any): void {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
