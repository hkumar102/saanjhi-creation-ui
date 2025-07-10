import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCurrencyPipe, ProductDto } from '@saanjhi-creation-ui/shared-common';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel'
import { TooltipModule } from 'primeng/tooltip';


@Component({
  selector: 'saanjhi-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: true,
  imports: [CarouselModule, FormsModule, CommonModule, ButtonModule, TooltipModule, AppCurrencyPipe]
})
export class ProductCardComponent implements OnInit {
  @Input() product!: ProductDto;
  @Output() editClicked = new EventEmitter<ProductDto>();
  @Output() previewClicked = new EventEmitter<ProductDto>();

  showCarousel = false;
  selectedImage: string | null = null;
  activeIndex = 0;

  ngOnInit(): void {
    this.activeIndex = 0;
    this.selectedImage = this.product?.media?.[this.activeIndex]?.url ?? null;
  }

  onCarouselPageChange(event: any): void {
    if (this.product?.media && event?.page < this.product.media.length) {
      this.activeIndex = event.page;
      this.selectedImage = this.product?.media?.[this.activeIndex]?.url ?? null;
    }
  }

  onEditClicked() {
    this.editClicked.emit(this.product);
  }

  onPreviewClicked() {
    this.previewClicked.emit(this.product);
  }

  changeImage() {
    this.activeIndex += 1; // Increment to the next image
    if (this.activeIndex >= (this.product?.media?.length || 0)) {
      this.activeIndex = 0; // Reset to first image if we exceed the length
    }
    this.selectedImage = this.product?.media?.[this.activeIndex]?.url ?? null;
  }
}