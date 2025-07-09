import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductFormComponent } from './product-form.component';
import { CreateProductCommand, ProductServiceClient, UpdateProductCommand } from '@saanjhi-creation-ui/shared-common';
import { NavigationService } from '../../services/navigation.service';
import { AdminBaseComponent } from '../../common/components/base/admin-base.component';

@Component({
  standalone: true,
  selector: 'app-product-create',
  imports: [CommonModule, ProductFormComponent],
  templateUrl: './product-create.component.html'
})
export class ProductCreateComponent extends AdminBaseComponent {
  private readonly service = inject(ProductServiceClient);
  private readonly navigationService = inject(NavigationService);

  async create(data: CreateProductCommand | UpdateProductCommand) {
    if (data) {
      try {
        await this.service.create(data);
        this.toast.success(this.formatter.format(this.ConfirmationMessages.createSuccess, data.name!));
        this.navigationService.goToProducts();
      } catch (error) {
        this.toast.error(this.formatter.format(this.ConfirmationMessages.createFailed, data.name!));
      }
    }
  }
}
