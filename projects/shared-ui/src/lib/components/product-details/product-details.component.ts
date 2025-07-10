import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { RatingModule } from 'primeng/rating';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { ProductDto } from '@saanjhi-creation-ui/shared-common';

export interface AddToCartData {
    productId: string;
    quantity: number;
    isRental: boolean;
    rentalDays?: number;
}

@Component({
    selector: 'saanjhi-product-details',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        GalleriaModule,
        RatingModule,
        InputNumberModule,
        FormsModule
    ],
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent {
    @Input() product!: ProductDto;
    @Input() loading: boolean = false;

    @Output() addToCart = new EventEmitter<AddToCartData>();
    @Output() addToWishlist = new EventEmitter<string>();
    @Output() rentNow = new EventEmitter<AddToCartData>();

    quantity: number = 1;
    rentalDays: number = 1;
    isRentalMode: boolean = false;
    activeImageIndex: number = 0;

    galleryResponsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 5
        },
        {
            breakpoint: '768px',
            numVisible: 3
        },
        {
            breakpoint: '560px',
            numVisible: 1
        }
    ];

    get productImages(): string[] {
        return this.product?.media?.map(m => m.url || '') || ['assets/images/default-clothing.svg'];
    }

    get hasImages(): boolean {
        return !!(this.product?.media && this.product.media.length > 0);
    }

    get isInStock(): boolean {
        return this.product?.quantity > 0;
    }

    get canRent(): boolean {
        return this.product?.isRentable && this.isInStock;
    }

    get maxRentalDays(): number {
        return this.product?.maxRentalDays || 30;
    }

    get totalRentalPrice(): number {
        if (!this.product?.rentalPrice) return 0;
        return this.product.rentalPrice * this.rentalDays;
    }

    onToggleMode(rental: boolean) {
        this.isRentalMode = rental;
        if (rental) {
            this.rentalDays = 1;
        }
    }

    onAddToCart() {
        if (this.isRentalMode) {
            this.rentNow.emit({
                productId: this.product.id,
                quantity: this.quantity,
                isRental: true,
                rentalDays: this.rentalDays
            });
        } else {
            this.addToCart.emit({
                productId: this.product.id,
                quantity: this.quantity,
                isRental: false
            });
        }
    }

    onAddToWishlist() {
        this.addToWishlist.emit(this.product.id);
    }

    isAddToCartDisabled(): boolean {
        return !this.isInStock || this.loading || this.quantity <= 0 ||
            (this.isRentalMode && this.rentalDays <= 0);
    }
}