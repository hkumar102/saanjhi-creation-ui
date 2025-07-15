import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';

@Pipe({
  name: 'filePreview',
  standalone: true,
  pure: false // Mark as impure so Angular re-runs the pipe on each change detection
})
export class FilePreviewPipe implements PipeTransform {
  private cache = new WeakMap<File, string>();

  constructor(private cd: ChangeDetectorRef) {}

  transform(file: File): string | null {
    if (!file) return null;
    if (this.cache.has(file)) {
      return this.cache.get(file)!;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.cache.set(file, reader.result as string);
      this.cd.markForCheck(); // Trigger change detection so the pipe re-runs
    };
    return '';
  }
}
