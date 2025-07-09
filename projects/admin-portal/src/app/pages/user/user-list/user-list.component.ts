import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserServiceClient } from '@saanjhi-creation-ui/shared-common';
import { UserDto } from '@saanjhi-creation-ui/shared-common';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { UiButtonComponent, UiInputComponent } from '@saanjhi-creation-ui/shared-ui';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiButtonComponent,
        UiInputComponent,
        TableModule,
        PaginatorModule
    ]
})
export class UserListComponent extends AdminBaseComponent {
    private readonly fb = inject(FormBuilder);
    private readonly userClient = inject(UserServiceClient);

    users: UserDto[] = [];
    totalRecords = 0;
    loading = false;

    page = 1;
    pageSize = 10;
    sortField = 'displayName';
    sortOrder: 1 | -1 = 1;

    filterForm: FormGroup = this.fb.group({
        name: [''],
        email: [''],
        phone: [''],
    });

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading = true;
        const { name, email, phone } = this.filterForm.value;

        this.userClient
            .searchUsers({
                Name: name,
                Email: email,
                Phone: phone,
                Page: this.page,
                PageSize: this.pageSize
            })
            .then(data => {
                this.users = data.items ?? [];
                this.totalRecords = data.totalCount ?? 0;
                this.cdr.markForCheck();
            })
            .finally(() => this.loading = false);
    }

    onLazyLoad(event: TableLazyLoadEvent): void {
        this.page = (event.first ?? 0) / (event.rows ?? 10) + 1;
        this.pageSize = event.rows ?? 10;
        this.sortField = (Array.isArray(event.sortField) && event.sortField.length > 0) ? event.sortField[0] : 'name';
        this.loadUsers();
    }

    onSearch(): void {
        this.page = 1;
        this.loadUsers();
    }

    onClear(): void {
        this.filterForm.reset();
        this.onSearch();
    }

    onPageChange(event: any): void {
        this.page = event.page + 1;
        this.pageSize = event.rows;
        this.loadUsers();
    }

    onSortChange(event: any): void {
        this.sortField = event.sortField ?? 'displayName';
        this.sortOrder = event.sortOrder;
        this.loadUsers();
    }

    onEdit(user: UserDto): void {
        this.navigation.goToUserEdit(user.id);
    }

    onCreate(): void {
        this.navigation.goToUserCreate();
    }
}
