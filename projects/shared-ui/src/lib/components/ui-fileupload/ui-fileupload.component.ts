import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { BaseFormControl } from '../base-form-control';

@Component({
  selector: 'saanjhi-ui-fileupload',
  standalone: true,
  imports: [CommonModule, FileUploadModule],
  templateUrl: './ui-fileupload.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiFileuploadComponent),
      multi: true
    }
  ]
})
export class UiFileuploadComponent extends BaseFormControl implements ControlValueAccessor {
  @Input() multiple = false;
  @Input() accept = '';
  @Input() placeholder = 'Choose file';
  @Input() disabled = false;

  @Output() fileSelected = new EventEmitter<File[]>();
  @Output() uploadRequested = new EventEmitter<void>();

  value: File[] = [];

  onChange = (value: File[]) => {};
  onTouched = () => {};

  writeValue(files: File[]): void {
    this.value = files || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFileSelect(event: any) {
    this.value = event.files;
    this.onChange(this.value);
    this.fileSelected.emit(this.value);
  }

  onClear() {
    this.value = [];
    this.onChange(this.value);
  }
}
