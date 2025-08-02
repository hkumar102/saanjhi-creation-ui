import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { UiFormControlComponent, UiTextareaComponent } from '@saanjhi-creation-ui/shared-ui';
import { DatePicker } from "primeng/datepicker";
import { RentalReturnedRequest } from '../../models/rental-workflow.model';
import { RentalDto, RentalStatus, RentalTimelineDto } from '@saanjhi-creation-ui/shared-common';


@Component({
    selector: 'app-rental-overdue-step',
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
    templateUrl: './overdue-step.component.html'
})
export class RentalOverdueStepComponent implements OnInit {
    private fb = inject(FormBuilder);

    @Input() initialNote: string = '';
    @Input() rental!: RentalDto;
    @Output() returnedConfirmed = new EventEmitter<RentalReturnedRequest>();

    form!: FormGroup;
    savedStepData?: RentalTimelineDto;
    stepStatus = RentalStatus.Overdue;


    ngOnInit() {
        if (this.rental) {
            const rentalTimeline = this.rental.timelines?.find(t => t.status === this.stepStatus);
            if (rentalTimeline) {
                this.savedStepData = rentalTimeline;
            }
        }
        this.form = this.fb.group({
            actualReturnDate: [new Date(), Validators.required],
            notes: [this.initialNote || '', [Validators.required, Validators.maxLength(500)]],
            status: [RentalStatus.Returned, Validators.required]
        });
    }

    onConfirm() {
        if (this.form.valid)
            this.returnedConfirmed.emit(this.form.value as RentalReturnedRequest);
        else
            this.form.markAllAsTouched();
    }
}