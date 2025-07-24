import { Component, inject } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { CommonModule } from '@angular/common';
import { RentalCreateSelectCustomerStepComponent } from './steps/select-customer-step/select-customer-step.component';
import { UiButtonComponent } from '@saanjhi-creation-ui/shared-ui';
import { CreateRentalCommand, CustomerDto, InventoryItemDto, ProductDto, RentalDto, RentalServiceClient } from '@saanjhi-creation-ui/shared-common';
import { RentalCreateSelectProductStepComponent } from './steps/select-product-step/select-product-step.component';
import { RentalCreateSelectInventoryStepComponent } from './steps/select-inventory-step/select-inventory-step.component';
import { CreateRentalModel, RentalCreateCustomerModel } from './models/create-rental.model';
import { RentalCreateDetailsStepComponent } from './steps/rental-details-step/rental-details-step.component';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';
@Component({
    selector: 'app-create-rental',
    standalone: true,
    imports: [
        CommonModule,
        StepperModule,
        RentalCreateSelectCustomerStepComponent,
        RentalCreateSelectProductStepComponent,
        UiButtonComponent,
        RentalCreateSelectInventoryStepComponent,
        RentalCreateDetailsStepComponent
    ],
    templateUrl: './create-rental.component.html',
    styleUrls: ['./create-rental.component.scss']
})
export class CreateRentalComponent extends AdminBaseComponent {
    private rentalClient = inject(RentalServiceClient);

    stepIndex = 1;
    createRentalModel: CreateRentalModel = {
        customer: null,
        rentalDetails: null,
        products: [],
        inventoryItems: []
    }

    onCustomerSelected(customer: RentalCreateCustomerModel | null): void {
        this.createRentalModel.customer = customer;
        // Handle customer selection logic here
        console.log('Selected Customer:', customer);
    }

    onProductsSelected(products: ProductDto[] | null): void {
        this.createRentalModel.products = products;
        // Handle products selection logic here
        console.log('Selected Products:', products);
    }

    onInventorySelected(inventoryItems: InventoryItemDto[]): void {
        this.createRentalModel.inventoryItems = inventoryItems;
        // Handle inventory selection logic here
        console.log('Selected Inventory Items:', inventoryItems);
    }

    onRentalDetailsChanged(rentalDetails: RentalDto): void {
        this.createRentalModel.rentalDetails = rentalDetails;
        // Handle rental details changes here
        console.log('Rental Details Changed:', rentalDetails);
    }

    async onSubmit() {
        // we need to put validation logic here
        // customer, products, inventoryItems, and rentalDetails should not be null
        if (!this.createRentalModel.customer || !this.createRentalModel.products?.length || !this.createRentalModel.inventoryItems?.length || !this.createRentalModel.rentalDetails) {
            this.toast.error('Please complete all steps before submitting.');
            return;
        }

        const payload: CreateRentalCommand = {
            productId : this.createRentalModel.rentalDetails.productId, // Assuming single product for simplicity
            inventoryItemId: this.createRentalModel.rentalDetails.inventoryItemId, // Assuming single inventory item for simplicity
            customerId: this.createRentalModel.rentalDetails.customerId,
            startDate: this.createRentalModel.rentalDetails.startDate,
            endDate: this.createRentalModel.rentalDetails.endDate,
            rentalPrice: this.createRentalModel.rentalDetails.rentalPrice,
            dailyRate: this.createRentalModel.rentalDetails.dailyRate,
            securityDeposit: this.createRentalModel.rentalDetails.securityDeposit,
            shippingAddressId: this.createRentalModel.rentalDetails.shippingAddressId,
            bookNumber: this.createRentalModel.rentalDetails.bookNumber,
            notes: this.createRentalModel.rentalDetails.notes,
            height: this.createRentalModel.rentalDetails.height,
            chest: this.createRentalModel.rentalDetails.chest,
            waist: this.createRentalModel.rentalDetails.waist,
            hip: this.createRentalModel.rentalDetails.hip,
            shoulder: this.createRentalModel.rentalDetails.shoulder,
            sleeveLength: this.createRentalModel.rentalDetails.sleeveLength, 
        }

        const rentalId = await this.rentalClient.createRental(payload);
        this.navigation.goToRentalManage(rentalId);
        this.toast.success('Rental created successfully!');
    }
}