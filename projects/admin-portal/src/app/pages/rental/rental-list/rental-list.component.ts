import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
    ViewChild,
    WritableSignal,
    OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    RentalServiceClient,
    RentalDto,
    PaginatedResult,
    AppCurrencyPipe,
    GetRentalsQuery
} from '@saanjhi-creation-ui/shared-common';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';
import {
    UiFormFieldComponent,
    UiButtonComponent,
    UiConfirmDialogComponent,
    CustomerSelectComponent,
    ProductSelectComponent,
} from "@saanjhi-creation-ui/shared-ui";
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { DatePickerModule } from "primeng/datepicker";
import { Card } from "primeng/card";

@Component({
    selector: 'app-rental-list',
    templateUrl: './rental-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        UiFormFieldComponent,
        CommonModule,
        ReactiveFormsModule,
        UiButtonComponent,
        TableModule,
        UiConfirmDialogComponent,
        DatePickerModule,
        AppCurrencyPipe,
        CustomerSelectComponent,
        ProductSelectComponent,
        Card
    ],
})
export class RentalListComponent extends AdminBaseComponent implements OnInit {
    private rentalClient = inject(RentalServiceClient);
    private fb = inject(FormBuilder);

    @ViewChild('confirmDialog') confirmDialog!: UiConfirmDialogComponent;

    filtersForm: FormGroup = this.fb.group({
        customerIds: [null],
        productIds: [null],
        dateRange: [null as Date[] | null]
    });

    // Data signals
    rentals: WritableSignal<RentalDto[]> = signal([]);
    totalRecords = signal(0);
    loading = signal(false);

    page = 1;
    pageSize = 10;
    sortField = 'startDate';
    sortOrder: 1 | -1 = -1;

    async ngOnInit() {
        await this.loadRentals();
    }

    async loadRentals(event?: TableLazyLoadEvent) {
        this.loading.set(true);

        if (event) {
            this.page = (event.first ?? 0) / (event.rows ?? 10) + 1;
            this.pageSize = event.rows ?? 10;
            this.sortField = Array.isArray(event.sortField) ? event.sortField[0] : 'startDate';
            this.sortOrder = event.sortOrder === 1 ? 1 : -1;
        }

        const filters = this.filtersForm.value;

        try {
            const formValue = this.filtersForm.value;
            // ✅ Extract date range
            let fromDate: string | undefined;
            let toDate: string | undefined;

            if (formValue.dateRange && Array.isArray(formValue.dateRange)) {
                const [start, end] = formValue.dateRange;
                fromDate = start.toISOString() || undefined;
                toDate = end.toISOString() || undefined;
            }

            const filter: GetRentalsQuery = {
                page: this.page,
                pageSize: this.pageSize,
                sortBy: this.sortField,
                descending: this.sortOrder === -1,
                fromDate,
                toDate,
                customerIds: formValue.customerIds?.length ? formValue.customerIds : undefined,
                productIds: formValue.productIds?.length ? formValue.productIds : undefined
            };

            const result: PaginatedResult<RentalDto> = await this.rentalClient.getRentals(filter);

            this.rentals.set(result.items ?? []);
            this.totalRecords.set(result.totalCount ?? 0);
        } finally {
            this.loading.set(false);
        }
    }

    onCreate() {
        this.navigation.goToRentalCreate();
    }

    onEdit(rental: RentalDto) {
        this.navigation.goToRentalEdit(rental.id);
    }

    async onDelete(rental: RentalDto) {
        this.confirmDialog.open({
            message: this.formatter.format(this.ConfirmationMessages.deleteConfirmation, rental.id),
            accept: async () => {
                try {
                    await this.rentalClient.deleteRental(rental.id);
                    this.toast.success(this.formatter.format(this.ConfirmationMessages.deleteSuccess, rental.id));
                    await this.loadRentals();
                } catch {
                    this.toast.error(this.formatter.format(this.ConfirmationMessages.deleteFailed, rental.id));
                }
            }
        });
    }

    onResetFilters() {
        this.filtersForm.reset();
        this.loadRentals();
    }
}