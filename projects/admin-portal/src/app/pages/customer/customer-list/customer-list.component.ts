import { ChangeDetectionStrategy, Component, inject, OnInit, ViewChild } from '@angular/core';
import { AppMessages, CustomerServiceClient, MessageFormatterService, ToastService } from '@saanjhi-creation-ui/shared-common';
import { CustomerDto } from '@saanjhi-creation-ui/shared-common';
import { NavigationService } from '../../../services/navigation.service';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { UiButtonComponent, UiConfirmDialogComponent, UiInputComponent, UiCardComponent } from '@saanjhi-creation-ui/shared-ui';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';

@Component({
    selector: 'app-customer-list',
    standalone: true,
    templateUrl: './customer-list.component.html',
    styleUrls: ['./customer-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TableModule,
        UiButtonComponent,
        UiInputComponent,
        CommonModule,
        ReactiveFormsModule,
        PaginatorModule,
        UiConfirmDialogComponent,
        UiCardComponent,
    ],
})
export class CustomerListComponent extends AdminBaseComponent implements OnInit {
    private readonly router = inject(NavigationService);
    private readonly fb = inject(FormBuilder);
    private readonly customerService = inject(CustomerServiceClient);

    @ViewChild('confirmDialog') confirmDialog!: UiConfirmDialogComponent;

    form: FormGroup = this.fb.group({
        search: ['']
    });
    customers: CustomerDto[] = [];
    loading = false;
    totalRecords = 0;
    page = 1;
    pageSize = 10;
    sortField = 'name';
    sortOrder = 1; // 1 = asc, -1 = desc


    ngOnInit(): void {
        this.loadCustomers();
    }

    loadCustomers(reset: boolean = false): void {
        if (reset) {
            this.page = 1;
        }

        const search = this.form.get('search')?.value;
        const query = {
            name: search,
            email: search,
            phoneNumber: search,
            page: this.page,
            pageSize: this.pageSize,
            sortBy: this.sortField,
            sortDesc: this.sortOrder === -1
        };

        this.loading = true;
        this.customerService.getCustomers(query)
            .then(data => {
                this.customers = data;
                this.totalRecords = data.length < this.pageSize ? ((this.page - 1) * this.pageSize) + data.length : this.page * this.pageSize + 1;
                this.cdr.markForCheck();
            })
            .finally(() => this.loading = false);
    }

    clearFilters(): void {
        this.form.reset();
        this.loadCustomers(true);
    }

    onLazyLoad(event: TableLazyLoadEvent): void {
        this.page = (event.first ?? 0) / (event.rows ?? 10) + 1;
        this.pageSize = event.rows ?? 10;
        this.sortField = (Array.isArray(event.sortField) && event.sortField.length > 0) ? event.sortField[0] : 'name';
        this.sortOrder = event.sortOrder ?? 1;
        this.loadCustomers();
    }

    onPageChange(event: any): void {
        this.page = (event.first ?? 0) / (event.rows ?? 10) + 1;
        this.pageSize = event.rows;
        this.loadCustomers();
    }

    navigateToCreate(): void {
        this.router.goToCustomerCreate();
    }

    navigateToEdit(id: string): void {
        this.router.goToCustomerEdit(id);
    }

    onDelete(customer: CustomerDto) {
        this.confirmDialog.open({
            message: this.formatter.format(this.ConfirmationMessages.deleteConfirmation, customer.name),
            accept: async () => {
                try {
                    await this.customerService.deleteCustomer(customer.id);
                    this.toast.success(this.formatter.format(this.ConfirmationMessages.deleteSuccess, customer.name));
                    await this.loadCustomers();
                } catch {
                    this.toast.error(this.formatter.format(this.ConfirmationMessages.deleteFailed, customer.name));
                }
            }
        });
    }
}
