import { Component, Input, Output, EventEmitter, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryDto, CategoryServiceClient, CreateProductCommand, MediaServiceClient, MediaType, MediaTypeDto, ProductMediaDto, UpdateProductCommand, ImageCompressionService } from '@saanjhi-creation-ui/shared-common';
import { UiInputComponent, UiButtonComponent, UiFormFieldComponent, UiFormErrorComponent, UiFileuploadComponent, UiDropdownComponent, UiSwitchComponent } from '@saanjhi-creation-ui/shared-ui';
import { AdminBaseComponent } from '../../common/components/base/admin-base.component';

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
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent extends AdminBaseComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private mediaService = inject(MediaServiceClient);
  private categoryService = inject(CategoryServiceClient);
  private imageCompressionService = inject(ImageCompressionService);

  @Input() model: UpdateProductCommand = {
    name: '',
    description: '',
    price: 0,
    quantity: 1,
    isActive: true,
    isRentable: false,
    rentalPrice: undefined,
    securityDeposit: undefined,
    maxRentalDays: undefined,
    categoryId: '',
    media: [],
    id: ''
  };

  @Output() formSubmit = new EventEmitter<CreateProductCommand | UpdateProductCommand>();

  mediaTypeOptions: MediaTypeDto[] = [];
  form!: FormGroup;
  mediaFiles: ProductMediaDto[] = [];
  selectedImages: { file: File; previewUrl: string }[] = [];
  categories: CategoryDto[] = [];

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
      mediaType: [MediaType.Image, Validators.required], // default to Image
      media: [this.model.media], // default to Image
      id: [this.model.id]
    });
  }

  async ngOnInit() {
    await Promise.all([
      this.loadMediaTypes(),
      this.loadCategories()
    ]);
    this.initializeForm();
  }

  private async loadMediaTypes(): Promise<void> {
    this.mediaTypeOptions = await this.mediaService.getMediaTypes();
  }

  async loadCategories() {
    const res = await this.categoryService.getAll();
    this.categories = res;
  }

  get selectedMediaType(): MediaType {
    return this.form?.get('mediaType')?.value as MediaType;
  }

  get mediaTypeAccept(): string {
    return this.selectedMediaType === MediaType.Video ? 'video/*' : 'image/*';
  }

  async onFileSelected(files: File[]) {
    for (const file of files) {
      try {
        const compressedFile = await this.imageCompressionService.compressImage(file);
        const previewUrl = URL.createObjectURL(compressedFile);
        this.selectedImages.push({ file: compressedFile, previewUrl });
      } catch (error) {
        throw error;
      }
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    try {
      await this.uploadAllMedia();
      const formValue = this.form.value as CreateProductCommand | UpdateProductCommand;
      this.formSubmit.emit(formValue);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  }

  async uploadAllMedia() {
    if (this.selectedImages.length === 0) return;
    
    const results = await Promise.all(
      this.selectedImages.map(file => this.mediaService.upload(file.file, this.selectedMediaType))
    );
    this.model.media?.push(...(results as ProductMediaDto[]));
    this.form.get('media')?.setValue(this.model.media);
  }

  getImagePreview(fileWrapper: { previewUrl: string }): string {
    return fileWrapper.previewUrl;
  }

  ngOnDestroy(): void {
    // Clean up object URLs to prevent memory leaks
    this.selectedImages.forEach(img => {
      if (img.previewUrl) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
  }

  removeImage(index: number): void {
    const removed = this.selectedImages.splice(index, 1)[0];
    if (removed?.previewUrl) {
      URL.revokeObjectURL(removed.previewUrl);
    }
  }

  removeExistingImage(index: number) {
    this.model.media?.splice(index, 1);
  }

}
