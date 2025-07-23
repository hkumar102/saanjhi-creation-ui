import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { DropdownModule } from 'primeng/dropdown';
import { StepsModule } from 'primeng/steps';
import { TimelineModule } from 'primeng/timeline';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { ImageModule } from 'primeng/image';
import { RentalServiceClient, AppCurrencyPipe, UpdateRentalStatusCommand, RentalStatus, RentalTimelineDto } from '@saanjhi-creation-ui/shared-common';
import { RentalDto, RentalStatusOptions } from '@saanjhi-creation-ui/shared-common';
import { RentalStatusLabelPipe } from '@saanjhi-creation-ui/shared-common';
import { FormsModule } from '@angular/forms';
import { Stepper, StepList, Step, StepPanels, StepPanel } from "primeng/stepper";
import { RentalPendingStepComponent } from "./workflow/pending/pending-step.component";
import { UiConfirmDialogComponent } from '@saanjhi-creation-ui/shared-ui';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';
import { RentalBookingRequest, RentalDeliveredRequest, RentalReturnedRequest, RentalStatusRequest } from './models/rental-workflow.model';
import { RentalBookedStepComponent } from './workflow/booked/booked-step.component';
import { RentalPickedUpStepComponent } from "./workflow/picked-up/picked-up-step.component";

@Component({
    selector: 'app-rental-management',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        BadgeModule,
        DropdownModule,
        StepsModule,
        TimelineModule,
        ButtonModule,
        TextareaModule,
        ImageModule,
        RentalStatusLabelPipe,
        FormsModule,
        AppCurrencyPipe,
        Stepper,
        StepList,
        Step,
        StepPanels,
        StepPanel,
        RentalPendingStepComponent,
        UiConfirmDialogComponent,
        RentalBookedStepComponent,
        RentalPickedUpStepComponent
    ],
    templateUrl: './rental-management.component.html',
    styleUrls: ['./rental-management.component.scss']
})
export class RentalManagementComponent extends AdminBaseComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private rentalService = inject(RentalServiceClient);

    @ViewChild('confirmDialog') confirmDialog!: UiConfirmDialogComponent;

    rental!: RentalDto;
    rentalStatusOptions = RentalStatusOptions;
    workflowSteps = [
        { label: 'Pending', value: 1, icon: 'fa-solid fa-clock', step: 1, description: 'Awaiting confirmation' },
        { label: 'Booked', value: 2, icon: 'fa-solid fa-book', step: 2, description: 'Booking confirmed' },
        { label: 'Delivered', value: 3, icon: 'fa-solid fa-arrow-up', step: 3, description: 'Item picked up' },
        { label: 'Returned', value: 4, icon: 'fa-solid fa-arrow-down', step: 4, description: 'Item returned' },
        { label: 'Cancelled', value: 5, icon: 'fa-solid fa-ban', step: 5, description: 'Booking cancelled' },
        { label: 'Overdue', value: 6, icon: 'fa-solid fa-clock', step: 6, description: 'Booking overdue' }
    ];
    activeStep = 0;
    note = '';
    timeline: RentalTimelineDto[] = [];
    currentStatusWorkflows: any[] = [];

    async ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            await this.loadRental(id);
            this.setWorkflowSteps();
        }
    }

    async loadRental(id: string) {
        this.rental = await this.rentalService.getRental(id);
        this.activeStep = this.rental.status; // Adjust for zero-based index
        this.timeline = this.rental.timelines || [];
    }

    getStepIndex(status: number): number {
        switch (status) {
            case 1: return 1; // Reserved
            case 2: return 2; // Active
            case 3: return 3; // Returned
            case 4: return 4; // Cancelled
            case 5: return 5; // Overdue
            case 6: return 6; // Damaged
            default: return 0;
        }
    }

    getStatusSeverity(status: number): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" {
        switch (status) {
            case 1: return 'info'; // Booked
            case 2: return 'warn'; // Shipped
            case 3: return 'success'; // Delivered
            case 4: return 'danger'; // Returned
            case 5: return 'danger'; // Cancelled
            case 6: return 'danger'; // Damaged
            default: return 'info';
        }
    }

    getPaymentSeverity(paymentStatus: string): string {
        switch (paymentStatus) {
            case 'Paid': return 'success';
            case 'Pending': return 'warning';
            case 'Error': return 'danger';
            default: return 'info';
        }
    }

    onStatusChange(event: any) {
        // Implement status change logic, call API if needed
    }

    onSaveNote() {
        // Implement save note logic
    }

    onNextStep() {
        // Implement next step logic
    }

    onReturnedConfirmed(data: RentalReturnedRequest) {
        const payload = { ...data, id: this.rental.id } as UpdateRentalStatusCommand;
        this.onStepActionHandler(payload);
    }

    onDeliveryConfirmed(data: RentalDeliveredRequest) {
        const payload = { ...data, id: this.rental.id } as UpdateRentalStatusCommand;
        this.onStepActionHandler(payload);
    }

    onBookingConfirmed(data: RentalStatusRequest) {
        const payload = { ...data, id: this.rental.id } as UpdateRentalStatusCommand;
        this.onStepActionHandler(payload);
    }

    onBookingCancelled(data: RentalStatusRequest) {
        const payload = { ...data, id: this.rental.id } as UpdateRentalStatusCommand;
        this.onStepActionHandler(payload);
    }

    onStepActionHandler(data: UpdateRentalStatusCommand) {
        this.confirmDialog.open({
            message: this.formatter.format(this.ConfirmationMessages.genericConfirmation),
            accept: async () => {
                await this.updateRentalStatus(data);
            }
        });
    }

    async updateRentalStatus(payload: UpdateRentalStatusCommand) {

        await this.rentalService.updateRentalStatus(payload.id, payload);
        this.toast.success(this.formatter.format(this.ConfirmationMessages.genericSuccess));
        await this.loadRental(this.rental.id);
        this.setWorkflowSteps();
    }

    private setWorkflowSteps() {
        switch (this.rental.status) {
            case RentalStatus.Pending:
                this.currentStatusWorkflows = this.workflowSteps.filter(step => step.value === RentalStatus.Pending || step.value === RentalStatus.Cancelled || step.value === RentalStatus.Booked);
                break;
            case RentalStatus.Booked:
                this.currentStatusWorkflows = this.workflowSteps.filter(step => step.value === RentalStatus.PickedUp || step.value === RentalStatus.Cancelled || step.value === RentalStatus.Booked);
                break;
            case RentalStatus.PickedUp:
                this.currentStatusWorkflows = this.workflowSteps.filter(step => step.value === RentalStatus.Returned || step.value === RentalStatus.Overdue || step.value === RentalStatus.PickedUp);
                break;
            case RentalStatus.Returned:
                this.currentStatusWorkflows = []; // No further steps after returned
                break;
            case RentalStatus.Cancelled:
                this.currentStatusWorkflows = []; // No further steps after cancelled
                break;
            case RentalStatus.Overdue:
                this.currentStatusWorkflows = []; // No further steps after overdue
                break;
            default:
                this.currentStatusWorkflows = []; // Default case, no steps
        }
    }
}