import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { ProductServiceClient, ProductDto, AppCurrencyPipe } from '@saanjhi-creation-ui/shared-common';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, GalleriaModule, ButtonModule, BadgeModule, ChipModule, AppCurrencyPipe],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductServiceClient);

  product?: ProductDto;
  images: any[] = [];
  isLoading = true;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.product = await this.productService.getById(id);
      this.images = this.product?.media?.map(m => ({
        itemImageSrc: m.url,
        thumbnailImageSrc: m.url,
        alt: this.product?.name,
        title: this.product?.name
      })) || [];
    }
    this.isLoading = false;
  }
}