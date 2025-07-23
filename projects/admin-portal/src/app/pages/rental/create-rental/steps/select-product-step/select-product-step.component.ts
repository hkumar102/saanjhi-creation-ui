import { Component, EventEmitter, Output, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductSelectComponent, UiFormControlComponent, UiButtonComponent } from '@saanjhi-creation-ui/shared-ui';
import { ProductServiceClient, ProductDto } from '@saanjhi-creation-ui/shared-common';
import { TableModule } from "primeng/table";

@Component({
    selector: 'app-rental-create-select-product-step',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiFormControlComponent,
        ProductSelectComponent
        // Import your actual product select component here if needed
        ,
        TableModule,
        UiButtonComponent
    ],
    templateUrl: './select-product-step.component.html',
    styleUrls: ['./select-product-step.component.scss']
})
export class RentalCreateSelectProductStepComponent implements OnInit {
    @Output() productsSelected = new EventEmitter<ProductDto[] | null>();
    @Input() selectedProducts: ProductDto[] | null = null;

    private readonly fb = inject(FormBuilder);

    form: FormGroup = this.fb.group({
        products: [[], Validators.required]
    });


    ngOnInit(): void {
        if(this.selectedProducts) {
            this.form.patchValue({ products: this.selectedProducts.map(p => p.id) });
        }
    }

    onProductsChange(products: ProductDto[] | ProductDto | null): void {
        this.selectedProducts = products as ProductDto[];
        this.emitProductSelection();
    }

    onRemoveProductClicked(product: ProductDto): void {
        if (this.selectedProducts) {
            this.selectedProducts = this.selectedProducts.filter(p => p.id !== product.id);
            this.form.patchValue({ products: this.selectedProducts.map(p => p.id) });
            this.emitProductSelection();
        }
    }

    private emitProductSelection(): void {
        // we will emit first selected product as an array
        const emitProducts = (this.selectedProducts && this.selectedProducts.length > 1) ? [this.selectedProducts[0]] : this.selectedProducts;
        this.productsSelected.emit(emitProducts);
    }
}