import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiButtonComponent, UiFormErrorComponent, UiFormFieldComponent, UiInputComponent } from '@saanjhi-creation-ui/shared-ui';
import { AppMessages, CategoryServiceClient } from '@saanjhi-creation-ui/shared-common';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    UiFormFieldComponent,
    UiFormErrorComponent,
    UiButtonComponent,
    UiInputComponent
  ],
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent extends AdminBaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryServiceClient);
  private readonly route = inject(ActivatedRoute);

  form: FormGroup = this.fb.group({
    id: [''],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]]
  });

  isEditMode = false;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      const category = await this.categoryService.getById(id);
      this.form.patchValue(category);
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;

    if (this.isEditMode) {
      try {
        await this.categoryService.update(this.form.value.id, this.form.value);
        this.toast.success(this.formatter.format(this.ConfirmationMessages.updateSuccess, this.form.value.name));
      } catch (error) {
        this.toast.error(this.formatter.format(this.ConfirmationMessages.updateFailed, this.form.value.name));
        return;
      }
    } else {
      try {
        await this.categoryService.create(this.form.value);
        this.toast.success(this.formatter.format(this.ConfirmationMessages.createSuccess, this.form.value.name));
      } catch (error) {
        this.toast.error(this.formatter.format(this.ConfirmationMessages.createFailed, this.form.value.name));
        return;
      }
    }
    this.navigation.goToCategories();
  }
}