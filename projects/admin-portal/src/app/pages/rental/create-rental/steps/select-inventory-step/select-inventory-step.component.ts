import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ProductDto, InventoryItemDto, InventoryServiceClient, ItemConditionLabelPipe, InventoryStatusLabelPipe } from '@saanjhi-creation-ui/shared-common';
import { UiFormControlComponent, UiButtonComponent } from '@saanjhi-creation-ui/shared-ui';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { Badge } from "primeng/badge";

@Component({
    selector: 'app-rental-create-select-inventory-step',
    standalone: true,
    templateUrl: './select-inventory-step.component.html',
    styleUrls: ['./select-inventory-step.component.scss'],
    imports: [
    CommonModule,
    UiFormControlComponent,
    TableModule,
    CheckboxModule,
    ItemConditionLabelPipe,
    InventoryStatusLabelPipe,
    ReactiveFormsModule,
    Badge
]
})
export class RentalCreateSelectInventoryStepComponent implements OnInit {
    @Input() selectedProducts: ProductDto[] = [];
    @Output() inventorySelected = new EventEmitter<InventoryItemDto[]>();

    private fb = inject(FormBuilder);

    form!: FormGroup;

    combinedInventoryItems: InventoryItemDto[] = [];

    constructor(private inventoryService: InventoryServiceClient) { }

    async ngOnInit() {
        this.form = this.fb.group({
            inventoryItems: [[], Validators.required] // FormArray for selected inventory items
        })
        await this.loadInventoryItems();
    }

    get inventoryItemControl(): FormControl {
        return this.form.get('inventoryItems') as FormControl;
    }

    async loadInventoryItems(): Promise<void> {
        if (!this.selectedProducts?.length) {
            this.combinedInventoryItems = [];
            return;
        }
        try {
            // Fetch inventory for all selected products
            const requests = this.selectedProducts.map(product =>
                this.inventoryService.getByProduct(product.id)
            );
            const results = await Promise.all(requests);
            this.combinedInventoryItems = results.flat();
        } finally {
        }
    }

    onInventoryRowSelected(event: TableRowSelectEvent<InventoryItemDto>): void {
        const currentValue = this.inventoryItemControl.value as InventoryItemDto[];
        this.inventoryItemControl.setValue([event.data]);
        this.emitSelectedInventory();
    }

    onInventoryRowUnselected(event: TableRowSelectEvent<InventoryItemDto>): void {
        if (!event.data) return;

        const selected = event.data as InventoryItemDto;
        const currentValue = this.inventoryItemControl.value as InventoryItemDto[];
        this.inventoryItemControl.setValue(currentValue.filter(item => item.id !== selected.id));
        this.emitSelectedInventory();
    }

    emitSelectedInventory(): void {
        const selectedInventory = this.inventoryItemControl.value as InventoryItemDto[];
        this.inventorySelected.emit(selectedInventory);
        console.log('Selected Inventory Items:', selectedInventory);
    }

    onRemoveInventoryClicked(item: InventoryItemDto): void {
        const currentValue = this.inventoryItemControl.value as InventoryItemDto[];
        const updatedValue = currentValue.filter(i => i.id !== item.id);
        this.inventoryItemControl.setValue(updatedValue);
        this.emitSelectedInventory();
    }
}