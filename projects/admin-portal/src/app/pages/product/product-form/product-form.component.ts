import { Component, Input, Output, EventEmitter, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CategoryDto,
  CategoryServiceClient,
  CreateProductCommand,
  MediaServiceClient,
  MediaType,
  MediaTypeDto,
  ProductMediaDto,
  ProductDto,
  ProductServiceClient,
  UpdateProductCommand,
  ImageCompressionService,
  ImageResizeService
} from '@saanjhi-creation-ui/shared-common';
import { UiInputComponent, UiButtonComponent, UiFormFieldComponent, UiFormErrorComponent, UiFileuploadComponent, UiDropdownComponent, UiSwitchComponent } from '@saanjhi-creation-ui/shared-ui';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';

@Component({
  standalone: true,
  selector: 'app-product-form',
  imports: [CommonModule,
    ReactiveFormsModule,
    UiInputComponent,
    UiButtonComponent,
    UiFormFieldComponent,
    UiFormErrorComponent,
    UiFileuploadComponent,
    UiDropdownComponent,
    UiSwitchComponent
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent extends AdminBaseComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mediaService = inject(MediaServiceClient);
  private categoryService = inject(CategoryServiceClient);
  private productService = inject(ProductServiceClient);
  private imageCompressionService = inject(ImageCompressionService);
  private imageResizeService = inject(ImageResizeService);

  productId: string | null = null;
  isEditMode = false;
  loading = false;
  model: ProductDto = this.getEmptyProduct();

  mediaTypeOptions: MediaTypeDto[] = [];
  form!: FormGroup;
  mediaFiles: ProductMediaDto[] = [];
  selectedImages: { file: File; previewUrl: string }[] = [];
  categories: CategoryDto[] = [];

  private getEmptyProduct(): ProductDto {
    return {
      id: '',
      name: '',
      description: '',
      price: 0,
      quantity: 1,
      isActive: true,
      isRentable: false,
      categoryId: '',
      media: []
    };
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: [this.model.name, Validators.required],
      description: [this.model.description],
      price: [this.model.price, [Validators.required, Validators.min(0)]],
      quantity: [this.model.quantity, [Validators.required, Validators.min(1)]],
      categoryId: [this.model.categoryId, Validators.required],
      isActive: [this.model.isActive],
      isRentable: [this.model.isRentable],
      rentalPrice: [this.model.rentalPrice],
      securityDeposit: [this.model.securityDeposit],
      maxRentalDays: [this.model.maxRentalDays],
      mediaType: [MediaType.Image, Validators.required],
      media: [this.model.media],
      id: [this.model.id]
    });
  }

  async ngOnInit() {
    // Get product ID from route params
    this.productId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.productId;

    try {
      this.loading = true;

      // Load dependencies
      await Promise.all([
        this.loadMediaTypes(),
        this.loadCategories()
      ]);

      // Load product if editing
      if (this.isEditMode && this.productId) {
        await this.loadProduct(this.productId);
      }

      // Initialize form after loading product
      this.initializeForm();
    } catch (error) {
      console.error('Error initializing form:', error);
      this.toast.error('Failed to initialize form');
    } finally {
      this.loading = false;
    }
  }

  private async loadProduct(productId: string): Promise<void> {
    try {
      const response = await this.productService.getById(productId);

      if (response) {
        this.model = response;
      } else {
        this.toast.error('Product not found');
        this.router.navigate(['/admin/products']);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      this.toast.error('Failed to load product');
      this.router.navigate(['/admin/products']);
    }
  }

  private async loadMediaTypes(): Promise<void> {
    try {
      this.mediaTypeOptions = await this.mediaService.getMediaTypes();
    } catch (error) {
      console.error('Error loading media types:', error);
      this.toast.error('Failed to load media types');
    }
  }

  async loadCategories() {
    try {
      const res = await this.categoryService.getAll();
      this.categories = res;
    } catch (error) {
      console.error('Error loading categories:', error);
      this.toast.error('Failed to load categories');
    }
  }

  get selectedMediaType(): MediaType {
    return this.form?.get('mediaType')?.value as MediaType;
  }

  get mediaTypeAccept(): string {
    return this.selectedMediaType === MediaType.Video ? 'video/*' : 'image/*';
  }

  get formTitle(): string {
    return this.isEditMode ? 'Edit Product' : 'Create Product';
  }

  get submitButtonLabel(): string {
    return this.isEditMode ? 'Update Product' : 'Create Product';
  }

  async onFileSelected(files: File[]) {
    for (const file of files) {
      try {
        const resizedFile = await this.imageResizeService.resizeForClothing(file);
        const compressedFile = await this.imageCompressionService.compressImage(resizedFile);
        const previewUrl = URL.createObjectURL(compressedFile);
        this.selectedImages.push({ file: compressedFile, previewUrl });
      } catch (error) {
        console.error('Error processing image:', error);
        this.toast.error('Error processing image');
      }
    }
  }

  async onSubmit(): Promise<boolean> {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fix form errors before submitting');
      return false;
    }

    let isValid = false;

    try {
      this.loading = true;

      // Upload any new media files
      await this.uploadAllMedia();

      const formValue = this.form.value;

      if (this.isEditMode) {
        // Update existing product
        const updateCommand: UpdateProductCommand = {
          ...formValue,
          id: this.productId!
        };

        await this.productService.update(this.productId!, updateCommand);
        this.toast.success('Product updated successfully');
      } else {
        // Create new product
        const createCommand: CreateProductCommand = formValue;

        const response = await this.productService.create(createCommand);

        if (response) {
          this.toast.success('Product created successfully');
        } else {
          this.toast.error('Failed to create product');
        }
      }

      isValid = true;
    } catch (error) {
      console.error('Error submitting form:', error);
      this.toast.error(this.isEditMode ? 'Failed to update product' : 'Failed to create product');
      isValid = false;
    } finally {
      this.loading = false;
    }

    return isValid;
  }

  async uploadAllMedia() {
    if (this.selectedImages.length === 0) return;

    try {
      const results = await Promise.all(
        this.selectedImages.map(file => this.mediaService.upload(file.file, this.selectedMediaType))
      );

      // Add new media to existing media
      if (!this.model.media) {
        this.model.media = [];
      }

      this.model.media.push(...(results as ProductMediaDto[]));
      this.form.get('media')?.setValue(this.model.media);

      // Clear selected images after upload
      this.clearSelectedImages();
    } catch (error) {
      console.error('Error uploading media:', error);
      this.toast.error('Failed to upload media files');
      throw error;
    }
  }

  private clearSelectedImages(): void {
    this.selectedImages.forEach(img => {
      if (img.previewUrl) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    this.selectedImages = [];
  }

  getImagePreview(fileWrapper: { previewUrl: string }): string {
    return fileWrapper.previewUrl;
  }

  ngOnDestroy(): void {
    // Clean up object URLs to prevent memory leaks
    this.clearSelectedImages();
  }

  removeImage(index: number): void {
    const removed = this.selectedImages.splice(index, 1)[0];
    if (removed?.previewUrl) {
      URL.revokeObjectURL(removed.previewUrl);
    }
  }

  removeExistingImage(index: number) {
    if (this.model.media) {
      this.model.media.splice(index, 1);
      this.form.get('media')?.setValue(this.model.media);
    }
  }

  async onSaveAndPreview() {
    if (await this.onSubmit()) {
      this.gotoProductDetails();
    }
  }

  async onSave() {
    if (await this.onSubmit()) {
      this.gotoProducts();
    }
  }

  gotoProducts() {
    this.navigation.goToProducts();
  }

  gotoProductDetails() {
    if (this.model.id) {
      this.navigation.goToProductDetails(this.model.id);
    }
  }
}
