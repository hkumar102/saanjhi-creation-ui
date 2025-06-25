import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductFormComponent } from './product-form.component';
import { CreateProductCommand, ProductServiceClient, UpdateProductCommand } from '@saanjhi-creation-ui/shared-common';
import { NavigationService } from '../../services/navigation.service';

@Component({
  standalone: true,
  selector: 'app-product-create',
  imports: [CommonModule, ProductFormComponent],
  templateUrl: './product-create.component.html'
})
export class ProductCreateComponent {
  private readonly service = inject(ProductServiceClient);
  private readonly navigationService = inject(NavigationService);

  async create(data: CreateProductCommand | UpdateProductCommand) {
    if (data) {
      await this.service.create(data);
      this.navigationService.goToProducts();
    }
  }
}
