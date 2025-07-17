import { CommonModule } from "@angular/common";
import { Component, Input, OnInit, model } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ProductDto, AppCurrencyPipe, ProductMediaDto } from "@saanjhi-creation-ui/shared-common";
import { Button } from "primeng/button";
import { ImageModule } from 'primeng/image';
import { GalleriaModule } from 'primeng/galleria';


@Component({
    selector: 'app-product-card',
    standalone: true,
    templateUrl: './product-card.component.html',
    styleUrls: ['./product-card.component.scss'],
    imports: [CommonModule, AppCurrencyPipe, Button, RouterModule, ImageModule, GalleriaModule],
})
export class ProductCardComponent implements OnInit {
    @Input() product!: ProductDto;
    defaultImage = 'assets/images/default-product.svg';
    images: ProductMediaDto[] = [];
    hasMedia = false;
    ngOnInit() {
        this.images = this.product.media?.length ? this.product.media : [{ url: this.defaultImage } as ProductMediaDto];
        this.hasMedia = Array.isArray(this.product.media) && this.product.media.length > 0;
    }
}