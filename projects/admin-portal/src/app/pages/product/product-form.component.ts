import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryDto, CategoryServiceClient, CreateProductCommand, MediaServiceClient, MediaType, MediaTypeDto, ProductMediaDto, UpdateProductCommand } from '@saanjhi-creation-ui/shared-common';
import { UiInputComponent, UiButtonComponent, UiFormFieldComponent, UiFormErrorComponent, UiFileuploadComponent, UiDropdownComponent, UiSwitchComponent } from '@saanjhi-creation-ui/shared-ui';

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
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mediaService = inject(MediaServiceClient);
  private categoryService = inject(CategoryServiceClient);

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

  async ngOnInit() {
    this.mediaTypeOptions = await this.mediaService.getMediaTypes();
    this.loadCategories();

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

  async loadCategories() {
    const res = await this.categoryService.getAll();
    this.categories = res;
  }

  get mediaTypeAccept(): string {
    const type = this.form?.get('mediaType')?.value as MediaTypeDto;
    return type && type.id === MediaType.Video ? 'video/*' : 'image/*';
  }

  onFileSelected(files: File[]) {
    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      this.selectedImages.push({ file, previewUrl });
    }
  }

  async onMediaSelected(files: File[]) {
    const mediaType = this.form.get('mediaType')?.value as MediaType;
    if (files && files.length > 0) {
      const file = files[0];
      const result = await this.mediaService.upload(file, mediaType);
      this.mediaFiles.push({
        url: result.url,
        publicId: result.publicId,
        mediaType: result.mediaType,
        id: '' // Use publicId as id if available
      });
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;
    await this.uploadAllMedia();
    await this.formSubmit.emit(this.form.value);
  }

  async uploadAllMedia() {
    if (this.selectedImages.length === 0) {
      return;
    }

    const mediaType = this.form.get('mediaType')?.value as MediaType;
    const results = await Promise.all(this.selectedImages.map(file => this.mediaService.upload(file.file, mediaType)));
    this.model.media?.push(...(results as ProductMediaDto[]))
    this.form.get('media')?.setValue(this.model.media);

  }

  getImagePreview(fileWrapper: { previewUrl: string }): string {
    return fileWrapper.previewUrl;
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  removeExistingImage(index: number) {
    this.model.media?.splice(index, 1);
  }

}
