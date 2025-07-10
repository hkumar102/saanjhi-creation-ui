import { ChangeDetectionStrategy, Component, inject, signal, ViewChild, WritableSignal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    CategoryDto,
    CategoryServiceClient,
    GetAllCategoriesQuery,
    PaginatedResult
} from '@saanjhi-creation-ui/shared-common';
import {
    UiButtonComponent,
    UiConfirmDialogComponent,
    UiFormFieldComponent,
    UiInputComponent,
    UiCardComponent
} from '@saanjhi-creation-ui/shared-ui';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';
import { Card } from "primeng/card";

@Component({
    selector: 'app-category-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UiConfirmDialogComponent,
        UiInputComponent,
        UiButtonComponent,
        UiFormFieldComponent,
        UiCardComponent,
        TableModule,
        Card
    ],
    templateUrl: './category-list.component.html',
    styleUrls: ['./category-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryListComponent extends AdminBaseComponent implements OnInit {
    private readonly categoryClient = inject(CategoryServiceClient);
    private readonly fb = inject(FormBuilder);

    @ViewChild('confirmDialog') confirmDialog!: UiConfirmDialogComponent;

    // Reactive signals
    categories: WritableSignal<CategoryDto[]> = signal([]);
    totalRecords = signal(0);
    loading = signal(false);

    // Search form
    searchForm: FormGroup = this.fb.group({
        search: [{ value: '', disabled: false }]
    });

    // Pagination state
    page = 1;
    pageSize = 10;
    sortField = 'name';
    sortOrder: 1 | -1 = 1;

    async ngOnInit() {
        await this.loadCategories();
    }

    async loadCategories(event?: TableLazyLoadEvent) {
        this.loading.set(true);

        if (event) {
            this.page = (event.first ?? 0) / (event.rows ?? 10) + 1;
            this.pageSize = event.rows ?? 10;
            this.sortField = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField || 'name';
            this.sortOrder = event.sortOrder === 1 ? 1 : -1;
        }

        const searchValue = this.searchForm.get('search')?.value;

        try {
            const query: GetAllCategoriesQuery = {
                page: this.page,
                pageSize: this.pageSize,
                sortBy: this.sortField,
                sortDesc: this.sortOrder === -1,
                search: searchValue || undefined
            };

            const result: PaginatedResult<CategoryDto> = await this.categoryClient.getAll(query);

            this.categories.set(result.items ?? []);
            this.totalRecords.set(result.totalCount ?? 0);
        } catch (error) {
            this.toast.error('Failed to load categories');
            console.error('Error loading categories:', error);
        } finally {
            this.loading.set(false);
        }
    }

    onSearch() {
        this.loadCategories();
    }

    onClearSearch() {
        this.searchForm.reset({ search: '' });
        this.loadCategories();
    }

    async onDelete(category: CategoryDto) {
        this.confirmDialog.open({
            message: this.formatter.format(this.ConfirmationMessages.deleteConfirmation, category.name),
            accept: async () => {
                try {
                    await this.categoryClient.delete(category.id);
                    this.toast.success(this.formatter.format(this.ConfirmationMessages.deleteSuccess, category.name));
                    await this.loadCategories();
                } catch {
                    this.toast.error(this.formatter.format(this.ConfirmationMessages.deleteFailed, category.name));
                }
            }
        });
    }

    onEdit(category: CategoryDto) {
        this.navigation.goToCategoryEdit(category.id);
    }

    onCreate() {
        this.navigation.goToCategoryCreate();
    }
}