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
import { RentalServiceClient, RentalDto, PaginatedResult, AppCurrencyPipe, GetRentalsQuery, RentalStatusLabelPipe, RentalStatusOptions, RentalStatus } from '@saanjhi-creation-ui/shared-common';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';
import { UiFormFieldComponent, UiButtonComponent, UiConfirmDialogComponent, CustomerSelectComponent, ProductSelectComponent, UiAutocompleteComponent, UiInputComponent, UiInputNumberComponent } from "@saanjhi-creation-ui/shared-ui";
import { CommonModule } from '@angular/common';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { DatePickerModule } from "primeng/datepicker";
import { Divider } from "primeng/divider";
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { debounceTime, takeUntil } from 'rxjs';
import { Image } from "primeng/image";

@Component({
    selector: 'app-rental-list',
    templateUrl: './rental-list.component.html',
    styleUrls: ['./rental-list.component.scss'],
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
    Divider,
    RentalStatusLabelPipe,
    RouterModule,
    ButtonModule,
    UiAutocompleteComponent,
    Menu,
    Image,
    UiInputNumberComponent,
    UiInputNumberComponent
],
})
export class RentalListComponent extends AdminBaseComponent implements OnInit {
    private rentalClient = inject(RentalServiceClient);
    private fb = inject(FormBuilder);

    @ViewChild('confirmDialog') confirmDialog!: UiConfirmDialogComponent;
    filtersForm: FormGroup = this.fb.group({
        customerIds: [null],
        productIds: [[]],
        dateRange: [[]],
        rentalStatus: [null],
        bookingDateRange: [[new Date(new Date().setDate(new Date().getDate() - 30)), new Date()]],
        bookNumber: [null]
    });

    // Data signals
    rentals: WritableSignal<RentalDto[]> = signal([]);
    totalRecords = signal(0);
    loading = signal(false);
    itemsShowing = 0;

    page = 1;
    pageSize = 10;
    sortField = 'startDate';
    sortOrder: 1 | -1 = -1;
    rentalStatuses = RentalStatusOptions;
    rowMenuItems: MenuItem[] = [];
    expandedRows: { [s: string]: boolean; } = {};

    async ngOnInit() {
        await this.loadRentals();

        this.filtersForm.valueChanges.pipe(
            debounceTime(300),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.loadRentals();
        });
    }

    async loadRentals(event?: TableLazyLoadEvent) {
        this.loading.set(true);

        if (event) {
            this.page = (event.first ?? 0) / (event.rows ?? 10) + 1;
            this.pageSize = event.rows ?? 10;
            this.sortField = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField as string;
            this.sortOrder = event.sortOrder === 1 ? 1 : -1;
        }

        const filters = this.filtersForm.value;

        try {
            const formValue = this.filtersForm.value;

            const filter: GetRentalsQuery = {
                page: this.page,
                pageSize: this.pageSize,
                sortBy: this.sortField,
                descending: this.sortOrder === -1,
                status: formValue.rentalStatus ? formValue.rentalStatus.value : undefined,
                customerIds: formValue.customerIds?.length ? formValue.customerIds : undefined,
                productIds: formValue.productIds?.length ? formValue.productIds : undefined,
                bookNumber: formValue.bookNumber || undefined
            };
            // ✅ Extract date range

            if (formValue.dateRange && Array.isArray(formValue.dateRange)) {
                const [start, end] = formValue.dateRange;
                filter.fromDate = start?.toISOString() || undefined;
                filter.toDate = end?.toISOString() || undefined;
            }

            if (formValue.bookingDateRange && Array.isArray(formValue.bookingDateRange)) {
                const [bookingStart, bookingEnd] = formValue.bookingDateRange;
                if (bookingStart) {
                    filter.bookingFromDate = bookingStart.toISOString();
                }
                if (bookingEnd) {
                    filter.bookingToDate = bookingEnd.toISOString();
                }
            }

            const result: PaginatedResult<RentalDto> = await this.rentalClient.getRentals(filter);

            this.rentals.set(result.items ?? []);
            this.totalRecords.set(result.totalCount ?? 0);
            this.itemsShowing = this.rentals().length + ((this.page - 1) * this.pageSize);

            this.rentals().forEach(rental => {
                this.expandedRows[rental.id] = true; // 'id' is the dataKey
            });
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

    onRowActionClicked(menu: Menu, row: RentalDto, event: any) {
        menu.toggle(event);    // Open at new position
        this.rowMenuItems = this.getMenuItemsForRow(row);
        event.stopPropagation();
    }

    private getMenuItemsForRow(row: RentalDto): MenuItem[] {
        const result = [];
        result.push({
            label: 'Edit',
            icon: 'fa-solid fa-pencil',
            command: () => this.onEdit(row)
        });
        result.push({
            label: 'Manage',
            icon: 'fa-solid fa-tasks',
            command: () => this.navigation.goTo(['rentals/manage', row.id])
        });

        return result;
    }
}