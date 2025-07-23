import { Component, EventEmitter, Input, Output, OnInit, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { UiFormControlComponent, UiTextareaComponent } from '@saanjhi-creation-ui/shared-ui';
import { DatePicker } from "primeng/datepicker";
import { RentalBookingRequest, RentalDeliveredRequest, RentalStatusRequest } from '../../models/rental-workflow.model';
import { RentalDto, RentalStatus, RentalTimelineDto } from '@saanjhi-creation-ui/shared-common';


@Component({
    selector: 'app-rental-booked-step',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        BadgeModule,
        TextareaModule,
        ButtonModule,
        UiFormControlComponent,
        UiTextareaComponent,
        DatePicker
    ],
    templateUrl: './booked-step.component.html'
})
export class RentalBookedStepComponent implements OnInit {
    private fb = inject(FormBuilder);

    @Input() initialNote: string = '';
    @Input() rental!: RentalDto;
    @Output() deliveryConfirmed = new EventEmitter<RentalDeliveredRequest>();
    @Output() bookingCancelled = new EventEmitter<RentalStatusRequest>();

    form!: FormGroup;
    savedStepData?: RentalTimelineDto;
    stepStatus = RentalStatus.Booked;


    ngOnInit() {
        if (this.rental) {
            const rentalTimeline = this.rental.timelines?.find(t => t.status === this.stepStatus);
            if (rentalTimeline) {
                this.savedStepData = rentalTimeline;
            }
        }
        this.form = this.fb.group({
            actualStartDate: [new Date(), Validators.required],
            notes: [this.initialNote || '', [Validators.required, Validators.maxLength(500)]],
            status: [RentalStatus.PickedUp, Validators.required]
        });
    }

    onConfirm() {
        if (this.form.valid)
            this.deliveryConfirmed.emit(this.form.value as RentalDeliveredRequest);
        else
            this.form.markAllAsTouched();
    }

    onCancel() {
        if (this.form.get('notes')?.valid) {
            const data: RentalStatusRequest = this.form.value as RentalStatusRequest;
            data.status = RentalStatus.Cancelled;
            this.bookingCancelled.emit(data);
        }
        else {
            this.form.get('notes')?.markAsTouched();
            this.form.get('notes')?.updateValueAndValidity();
        }
    }
}