import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { InventoryServiceClient, InventoryItemDto, AppCurrencyPipe, ItemConditionLabelPipe, ProductMediaDto } from '@saanjhi-creation-ui/shared-common';
import { AdminBaseComponent } from '../../../../common/components/base/admin-base.component';
import { GalleriaModule } from 'primeng/galleria';

@Component({
    selector: 'app-inventory-details',
    standalone: true,
    imports: [
        CommonModule,
        BadgeModule,
        ButtonModule,
        ImageModule,
        RouterModule,
        AppCurrencyPipe,
        ItemConditionLabelPipe,
        GalleriaModule
    ],
    templateUrl: './inventory-details.component.html',
    styleUrls: ['./inventory-details.component.scss']
})
export class InventoryDetailsComponent extends AdminBaseComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private inventoryService = inject(InventoryServiceClient);

    item?: InventoryItemDto;
    isLoading = true;
    inventoryImages: ProductMediaDto[] = [];

    async ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.item = await this.inventoryService.getById(id);
            if (this.item) {
                this.inventoryImages = this.item.media?.filter(m => m.size == this.item?.size && m.color == this.item?.color) || [];
            }
        }
        this.isLoading = false;
    }
}