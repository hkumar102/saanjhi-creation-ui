import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDto, ProductServiceClient } from '@saanjhi-creation-ui/shared-common';
import { ProductDetailsComponent, UiButtonComponent } from '@saanjhi-creation-ui/shared-ui';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';
import { ButtonModule } from 'primeng/button';

type ProductViewModel = ProductDto & { selectedImage?: string };

@Component({
    standalone: true,
    selector: 'app-product-details',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ProductDetailsComponent,
        ButtonModule,
        UiButtonComponent
    ],
    templateUrl: './product-details.component.html'
})
export class ProductDetailsPageComponent extends AdminBaseComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private productService = inject(ProductServiceClient);

    product: ProductDto | null = null;
    loading = false;
    productId: string = '';

    async ngOnInit() {
        // Get product ID from route params
        this.productId = this.route.snapshot.params['id'];

        if (this.productId) {
            await this.loadProduct();
        } else {
            this.toast.error('Product ID not found');
            this.navigation.goToProducts();
        }
    }

    private async loadProduct() {
        try {
            this.loading = true;

            // Load product using your existing service
            const response = await this.productService.getById(this.productId);
            this.product = response;
        } catch (error) {
            console.error('Error loading product:', error);
            this.toast.error('Failed to load product details');
        } finally {
            this.loading = false;
        }
    }

    onEditProduct() {
        this.navigation.goToProductEdit(this.productId);
    }

    onBackToList() {
        this.navigation.goToProducts();
    }
}