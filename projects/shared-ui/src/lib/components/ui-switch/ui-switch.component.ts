import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { BaseFormControl } from '../base-form-control';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'saanjhi-ui-switch',
  standalone: true,
  imports: [ToggleSwitchModule, CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <p-toggleSwitch
      [id]="inputId"
      [style]="style"
      [styleClass]="styleClass"
      [disabled]="disabled"
      (onChange)="onChangeFn($event.checked)"
      (onBlur)="onTouchedFn()"
      [ngModel]="value"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSwitchComponent),
      multi: true,
    },
  ],
})
export class UiSwitchComponent extends BaseFormControl implements ControlValueAccessor {
  @Input() style?: any;
  @Input() styleClass?: string;
  @Input() disabled = false;

  value = false;
  onChangeFn = (_: any) => { };
  onTouchedFn = () => { };

  writeValue(value: any): void {
    this.value = !!value;
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
