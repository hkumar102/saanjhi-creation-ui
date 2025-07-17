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
  template: `
    <p-checkbox
      [inputId]="inputId"
      [binary]="binary"
      [value]="value"
      [disabled]="disabled"
      [name]="name"
      [checked]="isChecked()"
      (onChange)="handleChange($event.checked)">
    </p-checkbox>
  `,
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

  @Output() change = new EventEmitter<any>();
  modelValue?: boolean | string | number | any[] | undefined | null;


  onChange = (val: any) => { };
  onTouched = () => { };


  writeValue(val: any): void {
    // this.modelValue = val;
    this.modelValue = this.binary ? val : val;
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

  handleChange(checked: boolean) {
    if (this.binary) {
      this.modelValue = checked;
    } else {
      let currentModelValue = Array.isArray(this.modelValue) ? [...this.modelValue] : [];
      const index = currentModelValue.findIndex(v => v === this.value);

      if (checked && index === -1) {
        currentModelValue.push(this.value);
      } else if (!checked && index !== -1) {
        currentModelValue.splice(index, 1);
      }

      this.modelValue = currentModelValue;
    }

    // this.onChange(this.modelValue);
    this.change.emit(this.modelValue);
  }

  isChecked(): boolean {
    if (this.binary) return !!this.modelValue;
    return Array.isArray(this.modelValue) && this.modelValue.includes(this.value);
  }

  onCheckboxChange(event: CheckboxChangeEvent) {
    this.onTouched();
    this.change.emit(this.modelValue);
  }
}
