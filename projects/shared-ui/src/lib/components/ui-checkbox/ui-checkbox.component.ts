import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
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
  @Input() value: any;
  @Input() name: string = '';
  @Input() binary: boolean = false;

  @Output() change = new EventEmitter<boolean>();
  modelValue: any = this.binary ? false : [];


  onChange = (val: any) => { };
  onTouched = () => { };


  writeValue(val: any): void {
    this.modelValue = val;
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


  onCheckboxChange(event: CheckboxChangeEvent) {
    if (this.binary) {
      this.modelValue = event.checked;
      this.onChange(this.modelValue);
    } else {
      const current = Array.isArray(this.modelValue) ? [...this.modelValue] : [];

      if (event.checked) {
        if (!current.includes(this.value)) {
          current.push(this.value);
        }
      } else {
        const index = current.indexOf(this.value);
        if (index !== -1) {
          current.splice(index, 1);
        }
      }

      this.modelValue = current;
      this.onChange(current);
    }

    this.onTouched();
  }
}
