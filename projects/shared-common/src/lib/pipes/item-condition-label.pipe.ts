import { Pipe, PipeTransform } from '@angular/core';
import { ItemCondition, itemConditionOptions } from '@saanjhi-creation-ui/shared-common';

@Pipe({
    name: 'itemConditionLabel',
    standalone: true
})
export class ItemConditionLabelPipe implements PipeTransform {
    transform(value: ItemCondition | number): string {
        const option = itemConditionOptions.find(opt => opt.value === value);
        return option ? option.label : '';
    }
}

import { RentalStatus, RentalStatusOptions } from '@saanjhi-creation-ui/shared-common';

@Pipe({
    name: 'rentalStatusLabel',
    standalone: true
})
export class RentalStatusLabelPipe implements PipeTransform {
    transform(value: RentalStatus | number): string {
        const option = RentalStatusOptions.find(opt => opt.value === value);
        return option ? option.label : '';
    }
}

import { InventoryStatus, InventoryStatusOptions } from '@saanjhi-creation-ui/shared-common';

@Pipe({
    name: 'inventoryStatusLabel',
    standalone: true
})
export class InventoryStatusLabelPipe implements PipeTransform {
    transform(value: InventoryStatus | number): string {
        const option = InventoryStatusOptions.find(opt => opt.value === value);
        return option ? option.label : '';
    }
}
