import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductFormComponent } from './product-form.component';
import { ProductServiceClient, UpdateProductCommand, CreateProductCommand } from '@saanjhi-creation-ui/shared-common';
import { NavigationService } from '../../services/navigation.service';
import { AdminBaseComponent } from '../../common/components/base/admin-base.component';

@Component({
  standalone: true,
  selector: 'app-product-edit',
  imports: [CommonModule, ProductFormComponent],
  templateUrl: './product-edit.component.html'
})
export class ProductEditComponent extends AdminBaseComponent {
  private readonly service = inject(ProductServiceClient);
  private readonly route = inject(ActivatedRoute);
  private readonly navigationService = inject(NavigationService);


  model!: UpdateProductCommand;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    const product = await this.service.getById(id);
    this.model = { ...product };
  }

  async update(data: UpdateProductCommand | CreateProductCommand) {
    const updateData: UpdateProductCommand = data as UpdateProductCommand;
    try {
      await this.service.update(updateData.id, updateData);
      this.toast.success(this.formatter.format(this.ConfirmationMessages.updateSuccess, updateData.name!));
      this.navigationService.goToProducts();
    } catch (error) {
      this.toast.error(this.formatter.format(this.ConfirmationMessages.updateFailed, updateData.name!));
    }
  }
}
