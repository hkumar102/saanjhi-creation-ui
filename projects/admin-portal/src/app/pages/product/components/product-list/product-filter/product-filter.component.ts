import { Component, EventEmitter, Input, input, OnInit, Output } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SliderModule, SliderSlideEndEvent } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { GetAllProductsQuery } from '@saanjhi-creation-ui/shared-common';
import { SidebarModule } from 'primeng/sidebar';
import { CategorySelectComponent, UiFormControlComponent } from "@saanjhi-creation-ui/shared-ui";
import { trigger, transition, style, animate, state } from '@angular/animations';

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
        SidebarModule,
        CategorySelectComponent,
        UiFormControlComponent
    ],
    animations: [
        trigger('slideIn', [
            state('void', style({ transform: 'translateY(20%)', opacity: 0 })),
            state('*', style({ transform: 'translateY(0)', opacity: 1 })),
            transition('void => *', animate('300ms ease-out')),
            transition('* => void', animate('200ms ease-in')),
        ])
    ]
})
export class ProductSearchComponent implements OnInit {
    @Input() isVisible = false;
    @Output() isVisibleChange = new EventEmitter<boolean>();
    @Output() filtersChanged = new EventEmitter<GetAllProductsQuery>();

    filterForm!: FormGroup;

    purchasePriceRange: [number, number] = [0, 10000];
    rentalPriceRange: [number, number] = [0, 5000];
    categoryOptions: { id: string; name: string }[] = [];
    sizeOptions: string[] = [];
    colorOptions: string[] = [];
    occasionOptions: string[] = [];
    seasonOptions: string[] = [];

    showDesktopFilters = false;
    defaultQuery = {
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
    }

    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
        this.filterForm = this.fb.group(this.defaultQuery);

        this.filterForm.patchValue({
            minPurchasePrice: this.purchasePriceRange[0],
            maxPurchasePrice: this.purchasePriceRange[1],
            minRentalPrice: this.rentalPriceRange[0],
            maxRentalPrice: this.rentalPriceRange[1],
            purchasePriceRange: this.purchasePriceRange,
            rentalPriceRange: this.rentalPriceRange
        });
    }

    onApplyFilters(): void {
        const query: GetAllProductsQuery = this.filterForm.getRawValue();
        this.filtersChanged.emit(query);
    }

    onResetFilters(): void {
        this.filterForm.reset(this.defaultQuery);
        this.filterForm.patchValue({});
        this.purchasePriceRange = [0, 10000];
        this.rentalPriceRange = [0, 5000];

        this.filtersChanged.emit(this.filterForm.getRawValue());
    }

    onPurchasePriceChange(event: SliderSlideEndEvent) {
        this.filterForm.patchValue({
            minPurchasePrice: event.values?.[0],
            maxPurchasePrice: event.values?.[1]
        });
    }

    onRentalPriceChange(event: SliderSlideEndEvent) {
        this.filterForm.patchValue({
            minRentalPrice: event.values?.[0],
            maxRentalPrice: event.values?.[1]
        });
    }
}