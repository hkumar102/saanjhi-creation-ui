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
import {
  UiInputComponent,
  UiButtonComponent,
  UiFormFieldComponent,
  UiFormErrorComponent,
  UiFileuploadComponent,
  UiDropdownComponent,
  UiSwitchComponent,
  CategorySelectComponent
} from '@saanjhi-creation-ui/shared-ui';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';

@Component({
  standalone: true,
  selector: 'app-product-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiInputComponent,
    UiButtonComponent,
    UiFormFieldComponent,
    UiFormErrorComponent,
    UiFileuploadComponent,
    UiDropdownComponent,
    UiSwitchComponent,
    CategorySelectComponent
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent extends AdminBaseComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mediaService = inject(MediaServiceClient);
  private productService = inject(ProductServiceClient);
  private imageCompressionService = inject(ImageCompressionService);
  private imageResizeService = inject(ImageResizeService);

  productId: string | null = null;
  isEditMode = false;
  loading = false;
  processingImages = false; // ✅ Added for image processing state
  model: ProductDto = this.getEmptyProduct();

  mediaTypeOptions: MediaTypeDto[] = [];
  mediaFiles: ProductMediaDto[] = [];
  selectedImages: { file: File; previewUrl: string; originalFile?: File; processedFile?: File }[] = [];

  // ✅ Image processing configuration
  private readonly imageProcessingConfig = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'image/jpeg' as const,
    thumbnailWidth: 300,
    thumbnailHeight: 300
  };

  // ✅ Initialize form immediately in property declaration
  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    categoryId: ['', Validators.required],
    isActive: [true],
    isRentable: [false],
    rentalPrice: [0],
    securityDeposit: [0],
    maxRentalDays: [30],
    mediaType: [MediaType.Image, Validators.required],
    media: [[]],
    id: ['']
  });

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

  async ngOnInit() {
    // Get product ID from route params
    this.productId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.productId;

    try {
      this.loading = true;

      // Load dependencies
      await this.loadMediaTypes();

      // Load product if editing
      if (this.isEditMode && this.productId) {
        await this.loadProduct(this.productId);
        // ✅ Update form with loaded product data
        this.updateFormWithProduct();
      }

    } catch (error) {
      console.error('Error initializing form:', error);
      this.toast.error('Failed to initialize form');
    } finally {
      this.loading = false;
    }
  }

  // ✅ New method to update form with product data
  private updateFormWithProduct(): void {
    if (!this.model) return;

    this.form.patchValue({
      name: this.model.name,
      description: this.model.description,
      price: this.model.price,
      quantity: this.model.quantity,
      categoryId: this.model.categoryId,
      isActive: this.model.isActive,
      isRentable: this.model.isRentable,
      rentalPrice: this.model.rentalPrice || 0,
      securityDeposit: this.model.securityDeposit || 0,
      maxRentalDays: this.model.maxRentalDays || 30,
      mediaType: MediaType.Image,
      media: this.model.media || [],
      id: this.model.id
    });
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

  // ✅ Enhanced file upload with image processing
  async onFileSelected(files: File[]): Promise<void> {
    if (!files || files.length === 0) return;

    this.processingImages = true;
    this.selectedImages = [];

    try {
      for (const file of files) {
        // Check if it's an image
        if (file.type.startsWith('image/')) {
          await this.processImage(file);
        } else if (file.type.startsWith('video/')) {
          await this.processVideo(file);
        } else {
          this.toast.warn(`Unsupported file type: ${file.type}`);
        }
      }
    } catch (error) {
      console.error('Error processing files:', error);
      this.toast.error('Failed to process some files');
    } finally {
      this.processingImages = false;
    }
  }

  // ✅ Process image with resizing and compression
  private async processImage(file: File): Promise<void> {
    try {
      const resizedFile = await this.imageResizeService.resizeForClothing(file);
      const compressedFile = await this.imageCompressionService.compressImage(resizedFile);
      const previewUrl = URL.createObjectURL(compressedFile);
      this.selectedImages.push({ file: compressedFile, previewUrl });

    } catch (error) {
      console.error('Error processing image:', error);
      this.toast.error(`Failed to process image: ${file.name}`);
    }
  }

  // ✅ Process video file
  private async processVideo(file: File): Promise<void> {
    try {
      throw new Error('Video processing is not implemented yet');
    } catch (error) {
      console.error('Error processing video:', error);
      this.toast.error(`Failed to process video: ${file.name}`);
    }
  }

  // ✅ Get image preview URL
  getImagePreview(image: { file: File; previewUrl: string }): string {
    return image.previewUrl;
  }

  // ✅ Remove selected image
  removeImage(index: number): void {
    const image = this.selectedImages[index];
    if (image.previewUrl) {
      URL.revokeObjectURL(image.previewUrl);
    }
    this.selectedImages.splice(index, 1);
  }

  // ✅ Remove existing image
  removeExistingImage(index: number): void {
    if (this.model.media) {
      this.model.media.splice(index, 1);
    }
  }

  // ✅ Get file size in human readable format
  getFileSizeString(file: File): string {
    const bytes = file.size;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ✅ Upload processed images
  private async uploadImages(): Promise<ProductMediaDto[]> {
    if (this.selectedImages.length === 0) return [];

    const uploadPromises = this.selectedImages.map(async (imageData) => {
      try {
        const response = await this.mediaService.upload(imageData.file, this.selectedMediaType);
        return response as ProductMediaDto;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  }

  // ✅ Save method with image upload
  async onSave(): Promise<void> {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fix the form errors');
      return;
    }

    try {
      this.loading = true;
      const formValue = this.form.value;

      // Upload new images if any
      let uploadedMedia: ProductMediaDto[] = [];
      if (this.selectedImages.length > 0) {
        uploadedMedia = await this.uploadImages();
      }

      // Combine existing media with new uploads
      const allMedia = [...(this.model.media || []), ...uploadedMedia];

      if (this.isEditMode) {
        const updateCommand: UpdateProductCommand = {
          id: this.productId!,
          ...formValue,
          media: allMedia
        };
        await this.productService.update(this.productId!, updateCommand);
        this.toast.success('Product updated successfully');
      } else {
        const createCommand: CreateProductCommand = {
          ...formValue,
          media: allMedia
        };
        const newProductId = await this.productService.create(createCommand);
        this.toast.success('Product created successfully');
        this.router.navigate(['/admin/products', newProductId]);
      }
    } catch (error) {
      this.toast.error('Failed to save product');
      throw error; // Re-throw to handle in the caller
    } finally {
      this.loading = false;
    }
  }

  // ✅ Save and preview method
  async onSaveAndPreview(): Promise<void> {
    await this.onSave();
    // Navigate to preview if save was successful
    if (this.productId) {
      this.navigation.goToProductDetails(this.productId);
    }
  }

  async onSubmit(): Promise<void> {
    await this.onSave();
    this.gotoProducts();
  }

  // ✅ Go to products method
  gotoProducts(): void {
    this.navigation.goToProducts();
  }

  ngOnDestroy(): void {
    // Clean up any remaining object URLs
    this.selectedImages.forEach(image => {
      if (image.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
      }
    });
  }
}
