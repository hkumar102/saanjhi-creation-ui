import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';

/**
 * Wrapper around PrimeNG's p-dropdown.
 * Supports ngModel and reactive forms.
 */
@Component({
  selector: 'saanjhi-ui-dropdown',
  standalone: true,
  imports: [CommonModule, DropdownModule, FormsModule],
  templateUrl: './ui-dropdown.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: UiDropdownComponent
    }
  ]
})
export class UiDropdownComponent implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() optionLabel = 'label';
  @Input() placeholder = 'Select';
  @Input() disabled = false;

  value: any;

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(val: any): void {
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
