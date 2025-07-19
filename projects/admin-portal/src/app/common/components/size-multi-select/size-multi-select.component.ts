import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { AvailableSizes } from '@saanjhi-creation-ui/shared-common';

@Component({
  selector: 'size-multi-select',
  templateUrl: './size-multi-select.component.html',
  styleUrls: ['./size-multi-select.component.scss'],
  standalone: true,
  imports: [CommonModule, CheckboxModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SizeMultiSelectComponent),
      multi: true
    }
  ]
})
export class SizeMultiSelectComponent implements ControlValueAccessor {
  @Input() sizes: string[] = AvailableSizes;

  selected: string[] = [];

  onChange = (val: any) => {};
  onTouched = () => {};

  toggleSize(size: string) {
    if (this.isSelected(size)) {
      this.selected = this.selected.filter(s => s !== size);
    } else {
      this.selected = [...this.selected, size];
    }
    this.onChange(this.selected);
    this.onTouched();
  }

  isSelected(size: string) {
    return this.selected.includes(size);
  }

  writeValue(value: string[]): void {
    this.selected = value || [];
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}