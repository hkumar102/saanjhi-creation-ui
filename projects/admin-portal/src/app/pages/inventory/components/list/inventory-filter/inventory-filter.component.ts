import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { AvailableColors, BaseComponent, InventoryStatusOptions } from '@saanjhi-creation-ui/shared-common';
import { UiAutocompleteComponent, UiFormControlComponent, ProductSelectComponent } from '@saanjhi-creation-ui/shared-ui';
import { ColorMultiSelectComponent } from '../../../../../common/components/color-multi-select/color-multi-select.component';
import { SizeMultiSelectComponent } from '../../../../../common/components/size-multi-select/size-multi-select.component';
import { debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-inventory-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MultiSelectModule,
    InputTextModule,
    UiAutocompleteComponent,
    DropdownModule,
    ButtonModule,
    UiFormControlComponent,
    ColorMultiSelectComponent,
    SizeMultiSelectComponent,
    ProductSelectComponent
],
  templateUrl: './inventory-filter.component.html',
  styleUrls: ['./inventory-filter.component.scss']
})
export class InventoryFilterComponent extends BaseComponent implements OnInit {
  @Input() products: any[] = [];
  @Output() filtersChanged = new EventEmitter<any>();

  filterForm!: FormGroup;
  colorOptions: string[] = AvailableColors.map(color => color.name); statusOptions = InventoryStatusOptions;
  // retiredOptions = [
  //   { label: 'All', value: true },
  //   { label: 'Retired', value: true },
  //   { label: 'Not Retired', value: false }
  // ];

  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      serialNumber: [''],
      sizes: [[]],
      colors: [[]],
      includeRetired: [true],
      statuses: [[]],
      productIds: [[]]
    });

    this.filterForm.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(val => {
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filtersChanged.emit(this.filterForm.getRawValue());
  }
}