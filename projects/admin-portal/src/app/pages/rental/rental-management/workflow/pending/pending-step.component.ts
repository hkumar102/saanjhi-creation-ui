import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { UiFormControlComponent, UiTextareaComponent } from '@saanjhi-creation-ui/shared-ui';
import { RentalStatusRequest } from '../../models/rental-workflow.model';
import { RentalDto, RentalStatus, RentalTimelineDto } from '@saanjhi-creation-ui/shared-common';


@Component({
    selector: 'app-rental-pending-step',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        BadgeModule,
        TextareaModule,
        ButtonModule,
        UiFormControlComponent,
        UiTextareaComponent
    ],
    templateUrl: './pending-step.component.html'
})
export class RentalPendingStepComponent implements OnInit {
    private fb = inject(FormBuilder);

    @Input() initialNote: string = '';
    @Input() rental!: RentalDto;
    @Output() bookingConfirmed = new EventEmitter<RentalStatusRequest>();
    @Output() bookingCancelled = new EventEmitter<RentalStatusRequest>();

    form!: FormGroup;
    savedStepData?: RentalTimelineDto;
    stepStatus = RentalStatus.Pending;


    ngOnInit() {
        if (this.rental) {
            const rentalTimeline = this.rental.timelines?.find(t => t.status === this.stepStatus);
            if (rentalTimeline) {
                this.savedStepData = rentalTimeline;
            }
        }
        this.form = this.fb.group({
            notes: [this.initialNote || '', [Validators.required, Validators.maxLength(500)]],
            status: [RentalStatus.Booked, Validators.required]
        });
    }

    onConfirm() {
        if (this.form.valid)
            this.bookingConfirmed.emit(this.form.value as RentalStatusRequest);
        else
            this.form.markAllAsTouched();
    }

    onCancel() {
        if (this.form.valid) {
            const data: RentalStatusRequest = this.form.value as RentalStatusRequest;
            data.status = RentalStatus.Cancelled;
            this.bookingCancelled.emit(data);
        }
        else
            this.form.markAllAsTouched();
    }
}