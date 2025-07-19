import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AvailableColors } from '@saanjhi-creation-ui/shared-common';

@Component({
  selector: 'color-multi-select',
  templateUrl: './color-multi-select.component.html',
  styleUrls: ['./color-multi-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorMultiSelectComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [CommonModule]
})
export class ColorMultiSelectComponent implements ControlValueAccessor {
  @Input() colors = AvailableColors;
  @Input() maxVisible = 8;

  selected: string[] = [];
  showAll = false;

  onChange = (val: any) => {};
  onTouched = () => {};

  get visibleColors() {
    return this.showAll ? this.colors : this.colors.slice(0, this.maxVisible);
  }

  toggleColor(color: string) {
    if (this.isSelected(color)) {
      this.selected = this.selected.filter(c => c !== color);
    } else {
      this.selected = [...this.selected, color];
    }
    this.onChange(this.selected);
    this.onTouched();
  }

  isSelected(color: string) {
    return this.selected.includes(color);
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