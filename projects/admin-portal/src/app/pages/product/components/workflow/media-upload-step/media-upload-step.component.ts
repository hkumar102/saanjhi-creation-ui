import { Component, OnInit, OnDestroy, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ProductWorkflowService } from '../../../services/product-workflow.service';
import { MediaUploadData, UploadedMediaFile, WorkflowEvent, WorkflowStep } from '../../../models/product-workflow.models';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { UiInputComponent, UiFormControlComponent, UiButtonComponent } from "@saanjhi-creation-ui/shared-ui";
import { Badge } from "primeng/badge";
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BaseProductFlowComponent } from '../../base-product-flow.component';
import { take, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export function requiredArray(control: AbstractControl): ValidationErrors | null {
  return (control instanceof FormArray && control.length > 0) ? null : { required: true };
}

@Component({
  selector: 'app-media-upload-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileUploadModule,
    CardModule,
    ButtonModule,
    DividerModule,
    FormsModule,
    AutoCompleteModule,
    CheckboxModule,
    UiInputComponent,
    UiFormControlComponent,
    UiButtonComponent,
    ProgressSpinnerModule
  ],
  templateUrl: './media-upload-step.component.html',
  styleUrls: ['./media-upload-step.component.scss']
})
export class MediaUploadStepComponent extends BaseProductFlowComponent implements OnInit {

  files: File[] = [];
  availableColors: string[] = [];
  previewUrls: string[] = [];
  mainImageIndex: number = 0;
  uploadError: string | null = null;
  isLoading = signal(false);
  mediaData: MediaUploadData | null = null;
  @Input() mediaForm!: FormGroup;


  private addFileToForm(file: UploadedMediaFile) {
    const fb = new FormBuilder();
    const fileGroup = fb.group({
      id: [file.id || null],
      file: [file.file || null, [Validators.required]],
      previewUrl: [file.previewUrl || ''],
      uploadStatus: [file.uploadStatus || 'pending'],
      uploadProgress: [file.uploadProgress || 0],
      color: [file.color || null, Validators.required],
      altText: [file.altText || 'Alt text', Validators.required],
      displayOrder: [file.displayOrder || 0],
      isPrimary: [file.isPrimary || false, Validators.required]
    });
    (this.mediaForm.get('uploadedFiles') as FormArray).push(fileGroup);
  }

  get uploadedFilesArray(): FormArray<FormGroup> {
    return this.mediaForm.get('uploadedFiles') as FormArray<FormGroup>;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    // Load media data from workflow state
    const state = (this.workflowService.state());
    const mediaData = state?.mediaData;
    if (mediaData) {
      this.mediaData = mediaData;
      this.workflowService.updateStepData(WorkflowStep.MEDIA_UPLOAD, mediaData);
      this.availableColors = state.productDetails?.availableColors || [];
    }

    this.uploadedFilesArray.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.saveToWorkflowState();
    });
  }

  async onFilesSelected(event: any): Promise<void> {
    this.uploadError = null;
    const newFiles: File[] = Array.from(event.files || event.currentFiles || []);
    newFiles.map(file => {
      this.generatePreview(file);
    })
    if (this.files.length && this.mainImageIndex >= this.files.length) {
      this.mainImageIndex = 0;
    }

  }

  onFileRemoved(index: number): void {
    this.files.splice(index, 1);
    this.uploadedFilesArray.removeAt(index);
    this.saveToWorkflowState();
  }

  async onExistingMediaRemoved(index: number): Promise<void> {
    if (this.mediaData && this.mediaData.existingMedia) {
      const media = this.mediaData.existingMedia[index];
      const mediaId = media.id;
      await this.workflowService.deleteExistingMedia(mediaId);
      this.mediaData.existingMedia.splice(index, 1);
      this.saveToWorkflowState();
    }
  }

  setMainImage(index: number): void {
    this.mainImageIndex = index;
    this.uploadedFilesArray.controls.forEach((fileGroup, i) => {
      fileGroup.get('isPrimary')?.setValue(i === index);
    });
    this.saveToWorkflowState();
  }

  isMainImage(index: number): boolean {
    return this.mainImageIndex === index;
  }

  reorderFiles(from: number, to: number): void {
    if (to < 0 || to >= this.files.length) return;
    const file = this.files.splice(from, 1)[0];
    const preview = this.previewUrls.splice(from, 1)[0];
    this.files.splice(to, 0, file);
    this.previewUrls.splice(to, 0, preview);
    if (this.mainImageIndex === from) {
      this.mainImageIndex = to;
    } else if (this.mainImageIndex > from && this.mainImageIndex <= to) {
      this.mainImageIndex--;
    } else if (this.mainImageIndex < from && this.mainImageIndex >= to) {
      this.mainImageIndex++;
    }
    this.saveToWorkflowState();
  }

  private generatePreview(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.createUploadMedia(file, base64);
      console.log('Preview generated for file:', file.name);
    };
    reader.onerror = () => {
      console.error('Failed to generate preview for file:', file.name);
    };
    reader.readAsDataURL(file);
  }

  private saveToWorkflowState(): void {
    const data = this.uploadedFilesArray.value as UploadedMediaFile[];
    this.workflowService.updateStepData(WorkflowStep.MEDIA_UPLOAD, {
      uploadedFiles: data,
      isValid: this.uploadedFilesArray.valid || ((this.mediaData?.existingMedia?.length ?? 0) > 0 && this.uploadedFilesArray.length == 0),
      existingMedia: this.mediaData?.existingMedia || []
    } as MediaUploadData);

  }

  private createUploadMedia(file: File, previewBase64: string): void {
    const newFile: UploadedMediaFile = {
      file: file,
      previewUrl: previewBase64,
      uploadStatus: 'pending',
      uploadProgress: 0,
      displayOrder: this.uploadedFilesArray.length,
      isPrimary: this.uploadedFilesArray.length === 0,
      color: '',
      altText: ''
    };
    this.addFileToForm(newFile);
    this.saveToWorkflowState();
    this.uploadedFilesArray.markAsDirty();
    this.uploadedFilesArray.markAsTouched();
    this.uploadedFilesArray.updateValueAndValidity();

  }

  isRealFile(file: any): boolean {
    return file && typeof File !== 'undefined' && file instanceof File;
  }

  searchColors($event: AutoCompleteCompleteEvent) {
    const query = $event.query.toLowerCase();
    this.availableColors = this.availableColors.filter(color => color.toLowerCase().includes(query));
  }
}
