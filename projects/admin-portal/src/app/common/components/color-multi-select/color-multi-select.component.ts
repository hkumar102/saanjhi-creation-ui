import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { AvailableColor, AvailableColors, ColorsService } from '@saanjhi-creation-ui/shared-common';
import { UiInputComponent } from "@saanjhi-creation-ui/shared-ui";

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
  imports: [
    CommonModule,
    UiInputComponent,
    ReactiveFormsModule]
})
export class ColorMultiSelectComponent implements ControlValueAccessor, OnInit {
  private colorService = inject(ColorsService);
  private fb = inject(FormBuilder);
  @Input() colors: AvailableColor[] = [];
  @Input() maxVisible = 8;
  @Input() showAll = false;

  form = this.fb.group({
    searchTerm: ['']
  })

  selected: string[] = [];


  onChange = (val: any) => { };
  onTouched = () => { };

  get visibleColors() {
    return this.showAll ? this.colors : this.colors.slice(0, this.maxVisible);
  }

  get filteredColors() {
    const term = this.searchTerm?.trim().toLowerCase();
    const filtered = term
      ? this.colors.filter(c => c.name.toLowerCase().includes(term))
      : this.colors.slice(0, this.maxVisible);
    return filtered;
  }

  get searchTerm(): string | null | undefined {
    return this.form.get('searchTerm')?.value;
  }


  ngOnInit() {
    this.colorService.colors$.subscribe(colors => {
      this.colors = colors;
    });
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

  showMoreColorsClick() {
    this.maxVisible += 20;
  }
}