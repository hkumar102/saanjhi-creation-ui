import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryDto, CategoryServiceClient, ToastService } from '@saanjhi-creation-ui/shared-common';
import { UiButtonComponent, UiConfirmDialogComponent, UiFormFieldComponent, UiInputComponent, UiPaginatorComponent, UiTableComponent, UiCardComponent } from '@saanjhi-creation-ui/shared-ui';
import { TableModule } from 'primeng/table';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';

@Component({
    selector: 'app-category-list',
    standalone: true,
    imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiConfirmDialogComponent,
    UiPaginatorComponent,
    UiInputComponent,
    UiButtonComponent,
    TableModule,
    UiCardComponent,
    UiCardComponent,
    UiFormFieldComponent
],
    templateUrl: './category-list.component.html'
})
export class CategoryListComponent extends AdminBaseComponent {
    private readonly categoryService = inject(CategoryServiceClient);
    private readonly router = inject(Router);

    @ViewChild('confirmDialog') confirmDialog!: UiConfirmDialogComponent;

    categories: CategoryDto[] = [];
    filtered: CategoryDto[] = [];
    searchTerm = '';

    page = 0;
    rows = 10;
    totalRecords = 0;

    async ngOnInit() {
        await this.loadCategories();
    }

    async loadCategories() {
        try {
            const data = await this.categoryService.getAll();
            this.categories = data;
            this.applyFilter();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    applyFilter() {
        this.filtered = this.categories.filter(c =>
            c.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
        this.totalRecords = this.filtered.length;
    }

    onPageChange(event: any) {
        this.page = event.page;
        this.rows = event.rows;
    }

    onDelete(category: CategoryDto) {
        this.confirmDialog.open({
            message: this.formatter.format(this.ConfirmationMessages.deleteConfirmation, category.name),
            accept: async () => {
                try {
                    await this.categoryService.delete(category.id);
                    this.toast.success(this.formatter.format(this.ConfirmationMessages.deleteSuccess, category.name));
                    await this.loadCategories();
                } catch {
                    this.toast.error(this.formatter.format(this.ConfirmationMessages.deleteFailed, category.name));
                }
            }
        });
    }

    onEdit(id: string) {
        this.navigation.goToCategoryEdit(id);
    }

    onCreate() {
        this.navigation.goToCategoryCreate();
    }
}