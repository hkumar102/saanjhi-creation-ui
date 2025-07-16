import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { ProductDto, AppCurrencyPipe } from "@saanjhi-creation-ui/shared-common";

@Component({
    selector: 'app-product-card',
    standalone: true,
    templateUrl: './product-card.component.html',
    styleUrls: ['./product-card.component.scss'],
    imports: [CommonModule, AppCurrencyPipe],
})
export class ProductCardComponent implements OnInit {
    @Input() product!: ProductDto;
    defaultImage = 'assets/images/default-product.svg';
    selectedImage: string | undefined;

    ngOnInit() {
        this.selectedImage = this.product.mainImage?.url ?? this.product.media?.[0]?.url ?? this.defaultImage; 
    }
}