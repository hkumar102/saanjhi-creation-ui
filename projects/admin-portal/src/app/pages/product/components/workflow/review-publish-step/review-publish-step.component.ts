import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor, AsyncPipe, CommonModule } from '@angular/common';
import { ProductWorkflowService } from '../../../services/product-workflow.service';
import { ProductWorkflowState, WorkflowStep } from '../../../models/product-workflow.models';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { AppCurrencyPipe } from '@saanjhi-creation-ui/shared-common';
import { TabsModule } from 'primeng/tabs';
@Component({
    selector: 'app-review-publish-step',
    standalone: true,
    templateUrl: './review-publish-step.component.html',
    styleUrls: ['./review-publish-step.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        CardModule,
        TagModule,
        BadgeModule,
        AccordionModule,
        TableModule,
        AppCurrencyPipe,
        TabsModule
    ]
})
export class ReviewPublishStepComponent implements OnInit {
    private workflowService = inject(ProductWorkflowService);
    workflow: ProductWorkflowState = this.workflowService.state();
    validationErrors: string[] = [];
    isMobile: boolean = false;

    ngOnInit(): void {
        this.isMobile = window.innerWidth < 768;
        this.validateAll();
        window.addEventListener('resize', this.onResize.bind(this));
        this.workflow = this.workflowService.state();
        this.validateAll();
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', this.onResize.bind(this));
    }

    onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    validateAll() {
        this.validationErrors = [];
        // Use service validation for each step
        const basicInfoValidation = this.workflow.basicInfo
        if (!basicInfoValidation?.isValid) {
            this.validationErrors.push('Basic Info is incomplete or invalid.');
        }

        const detailsValidation = this.workflow.productDetails;
        if (!detailsValidation?.isValid) {
            this.validationErrors.push('Product Details are incomplete or invalid.');
        }
        const mediaValidation = this.workflow.mediaData;
        if (!mediaValidation?.isValid) {
            this.validationErrors.push('Media Upload is incomplete or invalid.');
        }
        const inventoryValidation = this.workflow.inventoryData;
        if (!inventoryValidation?.isValid) {
            this.validationErrors.push('Inventory Setup is incomplete or invalid.');
        }
        // Add review step validation
    }

    isValid() {
        return this.validationErrors.length === 0;
    }

    isValidStep(step: WorkflowStep): boolean {
        return this.workflowService.validateStep(step);
    }

    editStep(step: string) {
        // Map string to WorkflowStep enum
        const stepMap = {
            basic: WorkflowStep.BASIC_INFO,
            details: WorkflowStep.PRODUCT_DETAILS,
            media: WorkflowStep.MEDIA_UPLOAD,
            inventory: WorkflowStep.INVENTORY_SETUP
        };
        this.workflowService.goToStep(stepMap[step as keyof typeof stepMap]);
    }

    async publish() {
        this.validateAll();
        if (this.validationErrors.length) return;
        const success = await this.workflowService.publishProduct();
        if (!success) {
            this.validationErrors.push('Failed to publish product. Please try again.');
        }
    }
}