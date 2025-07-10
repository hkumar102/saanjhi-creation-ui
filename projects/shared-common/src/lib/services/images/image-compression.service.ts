import { Injectable } from '@angular/core';
import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageCompressionService {
  private defaultOptions: CompressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    quality: 0.8
  };

  async compressImage(file: File, options?: CompressionOptions): Promise<File> {
    // Only compress image files
    if (!file.type.startsWith('image/')) {
      return file;
    }

    const compressionOptions = { ...this.defaultOptions, ...options };

    try {
      const compressedFile = await imageCompression(file, compressionOptions);
      console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
      return compressedFile;
    } catch (error) {
      console.error('Image compression failed:', error);
      return file; // Return original file if compression fails
    }
  }

  async compressMultipleImages(files: File[], options?: CompressionOptions): Promise<File[]> {
    return Promise.all(files.map(file => this.compressImage(file, options)));
  }
}