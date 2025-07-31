import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SliderModule, SliderSlideEndEvent } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { BaseComponent, CategoryDto, ColorCodePipe, GetAllProductsQuery, ProductActiveFilter, ProductFilterEvent } from '@saanjhi-creation-ui/shared-common';
import { DrawerModule } from 'primeng/drawer';
import { UiFormControlComponent } from "@saanjhi-creation-ui/shared-ui";
import { trigger, transition, style, animate, state } from '@angular/animations';
import { CheckboxModule } from "primeng/checkbox";
import { debounceTime, takeUntil } from 'rxjs';
import { ColorMultiSelectComponent } from '../../../../../common/components/color-multi-select/color-multi-select.component';
import { SizeMultiSelectComponent } from '../../../../../common/components/size-multi-select/size-multi-select.component';

@Component({
    selector: 'app-product-filter',
    standalone: true,
    templateUrl: './product-filter.component.html',
    styleUrls: ['./product-filter.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        InputTextModule,
        MultiSelectModule,
        DropdownModule,
        ToggleSwitchModule,
        SliderModule,
        ButtonModule,
        PanelModule,
        DrawerModule,
        UiFormControlComponent,
        CheckboxModule,
        ColorMultiSelectComponent,
        SizeMultiSelectComponent
    ],
    animations: [
        trigger('slideIn', [
            state('void', style({ transform: 'translateY(20%)', opacity: 0 })),
            state('*', style({ transform: 'translateY(0)', opacity: 1 })),
            transition('void => *', animate('300ms ease-out')),
            transition('* => void', animate('200ms ease-in')),
        ])
    ],
    host: {
        class: ''
    }
})
export class ProductFilterComponent extends BaseComponent implements OnInit {

    private fb = inject(FormBuilder);

    @Input() categories: CategoryDto[] = [];
    @Input() isVisible = false;
    @Input() colors: string[] = [];
    @Input() sizes: string[] = [];
    @Output() isVisibleChange = new EventEmitter<boolean>();
    @Output() filtersChanged = new EventEmitter<ProductFilterEvent>();

    filterForm!: FormGroup;
    purchasePriceRange: [number, number] = [0, 100000];
    rentalPriceRange: [number, number] = [0, 50000];
    categoryOptions: { id: string; name: string }[] = [];
    sizeOptions: string[] = [];
    colorOptions: string[] = [];
    occasionOptions: string[] = [];
    seasonOptions: string[] = [];
    activeFilters: ProductActiveFilter[] = [];
    //Color selection logic
    showAll = false;
    selectedColors: string[] = [];
    get visibleColors(): string[] {
        return this.showAll ? this.colors : this.colors.slice(0, 5);
    }

    showDesktopFilters = false;
    defaultQuery = {
        search: '',
        categoryIds: [],
        isRentable: null,
        isPurchasable: null,
        isActive: null,
        minPurchasePrice: null,
        maxPurchasePrice: null,
        minRentalPrice: null,
        maxRentalPrice: null,
        brand: '',
        designer: '',
        sizes: [],
        colors: [],
        material: '',
        occasion: '',
        season: '',
        hasAvailableInventory: null,
        minAvailableQuantity: null,
        sortBy: '',
        sortDesc: false,
        includeMedia: true,
        includeInventory: false,
        organizeMediaByColor: true,
        purchasePriceRange: this.purchasePriceRange,
        rentalPriceRange: this.rentalPriceRange
    }


    ngOnInit(): void {
        this.initFormGroup();
        this.onApplyFilters();
    }



    onApplyFilters(): void {
        const query: GetAllProductsQuery = this.filterForm.getRawValue();
        this.filtersChanged.emit({ query, activeFilters: this.activeFilters });
    }

    onResetFilters(): void {
        this.activeFilters = [];
        this.filterForm.patchValue(this.defaultQuery, { emitEvent: false });
        this.filterForm.updateValueAndValidity();
        this.purchasePriceRange = [0, 10000];
        this.rentalPriceRange = [0, 5000];
        this.showAll = false;
        this.onApplyFilters();
    }

    onPurchasePriceChange(event: SliderSlideEndEvent) {
        // only update if values are different
        if (event.values?.[0] === this.filterForm.get('minPurchasePrice')?.value && event.values?.[1] === this.filterForm.get('maxPurchasePrice')?.value) {
            return;
        }

        this.filterForm.patchValue({
            minPurchasePrice: event.values?.[0],
            maxPurchasePrice: event.values?.[1]
        });
    }

    onRentalPriceChange(event: SliderSlideEndEvent) {
        // only update if values are different
        if (event.values?.[0] === this.filterForm.get('minRentalPrice')?.value && event.values?.[1] === this.filterForm.get('maxRentalPrice')?.value) {
            return;
        }

        this.filterForm.patchValue({
            minRentalPrice: event.values?.[0],
            maxRentalPrice: event.values?.[1]
        });
    }

    toggleColor(color: string) {
        const index = this.selectedColors.indexOf(color);
        if (index === -1) {
            this.selectedColors.push(color);
        } else {
            this.selectedColors.splice(index, 1);
        }

        this.filterForm.patchValue({ colors: this.selectedColors });
    }

    isColorSelected(color: string): boolean {
        return this.selectedColors.includes(color);
    }

    private subscribeToFormChanges() {
        Object.keys(this.filterForm.controls).forEach(key => {
            this.filterForm.get(key)?.valueChanges
                .pipe(
                    debounceTime(500),
                    takeUntil(this.destroy$))
                .subscribe(value => {
                    this.onFormValueChanged(key, value);
                    this.onApplyFilters();
                });
        });
    }

    private onFormValueChanged(key: string, value: any) {
        if (!value || value.length === 0 || value === '') {
            this.activeFilters = this.activeFilters.filter(f => f.key !== key);
            return;
        }
        if (key === 'colors') {
            //if key already exists, update it
            const existingFilterIndex = this.activeFilters.findIndex(f => f.key === 'colors');
            if (existingFilterIndex > -1) {
                this.activeFilters[existingFilterIndex].value = value.join(' | ');
                return;
            }
            this.activeFilters.push({
                label: 'Color',
                value: value.join(' | '),
                key: 'colors'
            });
        }

        if (key === 'sizes') {
            //if key already exists, update it
            const existingFilterIndex = this.activeFilters.findIndex(f => f.key === 'sizes');
            if (existingFilterIndex > -1) {
                this.activeFilters[existingFilterIndex].value = value.join(' | ');
                return;
            }
            //if not, add it
            this.activeFilters.push({
                label: 'Size',
                value: value.join(' | '),
                key: 'sizes'
            });
        }

        if (key === 'categoryIds') {

            const categoryIds = value as string[];
            const selectedCategories = this.categories.filter(c => categoryIds.includes(c.id));

            const existingFilterIndex = this.activeFilters.findIndex(f => f.key === 'categoryIds');
            if (existingFilterIndex > -1) {
                this.activeFilters[existingFilterIndex].value = selectedCategories.map(c => c.name).join(' | ');
            } else {
                this.activeFilters.push({
                    label: 'Category',
                    value: selectedCategories.map(c => c.name).join(' | '),
                    key: 'categoryIds'
                });
            }

        }

        if (key === 'search') {
            //if key already exists, update it
            const existingFilterIndex = this.activeFilters.findIndex(f => f.key === 'search');
            if (existingFilterIndex > -1) {
                this.activeFilters[existingFilterIndex].value = value || '';
                return;
            }
            this.activeFilters.push({
                label: 'Search',
                value: value || '',
                key: 'search'
            });
        }
    }

    private initFormGroup() {
        this.filterForm = this.fb.group({
            search: [''],
            categoryIds: [[]],
            isRentable: [null],
            isPurchasable: [null],
            isActive: [null],
            minPurchasePrice: [null],
            maxPurchasePrice: [null],
            minRentalPrice: [null],
            maxRentalPrice: [null],
            brand: [''],
            designer: [''],
            sizes: [[]],
            colors: [[]],
            material: [''],
            occasion: [''],
            season: [''],
            hasAvailableInventory: [null],
            minAvailableQuantity: [null],
            sortBy: [''],
            sortDesc: [false],
            includeMedia: [true],
            includeInventory: [false],
            organizeMediaByColor: [true],
            purchasePriceRange: [this.purchasePriceRange],
            rentalPriceRange: [this.rentalPriceRange]
        });

        this.subscribeToFormChanges();
    }
}