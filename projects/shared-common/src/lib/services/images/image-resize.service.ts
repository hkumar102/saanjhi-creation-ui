import { Injectable } from '@angular/core';

export interface ResizeOptions {
  width: number;
  height: number;
  strategy: 'cover' | 'contain' | 'fill';
  backgroundColor?: string;
  quality?: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageResizeService {

  /**
   * Get image dimensions from file
   */
  getImageDimensions(file: File): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Resize image with automatic aspect ratio detection and adaptive sizing
   */
  async resizeImageAuto(file: File, options?: { quality?: number; backgroundColor?: string }): Promise<File> {
    const dimensions = await this.getImageDimensions(file);
    const isPortrait = dimensions.height > dimensions.width;

    // Base dimensions for the aspect ratio
    const basePortrait = { width: 300, height: 400 }; // 3:4
    const baseLandscape = { width: 320, height: 240 }; // 4:3

    // Calculate adaptive size based on original image size
    const targetDimensions = this.calculateAdaptiveSize(
      dimensions,
      isPortrait ? basePortrait : baseLandscape
    );

    return this.resizeImage(file, {
      ...targetDimensions,
      strategy: 'cover',
      backgroundColor: options?.backgroundColor || '#f8f9fa',
      quality: options?.quality || 0.95
    });
  }

  /**
   * Calculate adaptive size - use 3x base ratio if source is large enough
   */
  private calculateAdaptiveSize(
    sourceDimensions: ImageDimensions,
    baseDimensions: { width: number; height: number }
  ): { width: number; height: number } {
    const { width: sourceWidth, height: sourceHeight } = sourceDimensions;
    const { width: baseWidth, height: baseHeight } = baseDimensions;

    // Calculate if we can use 2x or 3x the base size
    const canUse3x = sourceWidth >= baseWidth * 3 && sourceHeight >= baseHeight * 3;
    const canUse2x = sourceWidth >= baseWidth * 2 && sourceHeight >= baseHeight * 2;

    if (canUse3x) {
      return {
        width: baseWidth * 3,   // 900x1200 for portrait or 960x720 for landscape
        height: baseHeight * 3
      };
    } else if (canUse2x) {
      return {
        width: baseWidth * 2,   // 600x800 for portrait or 640x480 for landscape
        height: baseHeight * 2
      };
    } else {
      return {
        width: baseWidth,       // 300x400 for portrait or 320x240 for landscape
        height: baseHeight
      };
    }
  }

  /**
   * Resize for clothing products with adaptive sizing
   */
  async resizeForClothing(file: File): Promise<File> {
    return this.resizeImageAuto(file, {
      quality: 0.95,
      backgroundColor: '#f8f9fa'
    });
  }

  /**
   * Alternative: Custom size thresholds
   */
  async resizeForClothingWithThresholds(file: File): Promise<File> {
    const dimensions = await this.getImageDimensions(file);
    const isPortrait = dimensions.height > dimensions.width;

    let targetDimensions;

    if (isPortrait) {
      // Portrait sizing thresholds
      if (dimensions.width >= 1800 && dimensions.height >= 2400) {
        targetDimensions = { width: 600, height: 800 };  // 2x
      } else if (dimensions.width >= 900 && dimensions.height >= 1200) {
        targetDimensions = { width: 450, height: 600 };  // 1.5x
      } else {
        targetDimensions = { width: 300, height: 400 };  // 1x
      }
    } else {
      // Landscape sizing thresholds
      if (dimensions.width >= 1920 && dimensions.height >= 1440) {
        targetDimensions = { width: 640, height: 480 };  // 2x
      } else if (dimensions.width >= 960 && dimensions.height >= 720) {
        targetDimensions = { width: 480, height: 360 };  // 1.5x
      } else {
        targetDimensions = { width: 320, height: 240 };  // 1x
      }
    }

    return this.resizeImage(file, {
      ...targetDimensions,
      strategy: 'cover',
      backgroundColor: '#f8f9fa',
      quality: 0.95
    });
  }

  /**
   * Get optimal size based on source dimensions
   */
  getOptimalClothingSize(sourceDimensions: ImageDimensions): { width: number; height: number; scale: number } {
    const isPortrait = sourceDimensions.height > sourceDimensions.width;

    if (isPortrait) {
      // Portrait: base is 300x400 (3:4 ratio)
      const baseWidth = 300;
      const baseHeight = 400;

      // Determine scale based on source size
      let scale = 1;
      if (sourceDimensions.width >= 1800 && sourceDimensions.height >= 2400) {
        scale = 3; // 900x1200
      } else if (sourceDimensions.width >= 1200 && sourceDimensions.height >= 1600) {
        scale = 2; // 600x800
      } else if (sourceDimensions.width >= 600 && sourceDimensions.height >= 800) {
        scale = 1.5; // 450x600
      }

      return {
        width: Math.round(baseWidth * scale),
        height: Math.round(baseHeight * scale),
        scale
      };
    } else {
      // Landscape: base is 320x240 (4:3 ratio)
      const baseWidth = 320;
      const baseHeight = 240;

      let scale = 1;
      if (sourceDimensions.width >= 1920 && sourceDimensions.height >= 1440) {
        scale = 3; // 960x720
      } else if (sourceDimensions.width >= 1280 && sourceDimensions.height >= 960) {
        scale = 2; // 640x480
      } else if (sourceDimensions.width >= 640 && sourceDimensions.height >= 480) {
        scale = 1.5; // 480x360
      }

      return {
        width: Math.round(baseWidth * scale),
        height: Math.round(baseHeight * scale),
        scale
      };
    }
  }

  /**
   * Resize for clothing with optimal sizing
   */
  async resizeForClothingOptimal(file: File): Promise<File> {
    const dimensions = await this.getImageDimensions(file);
    const optimal = this.getOptimalClothingSize(dimensions);

    console.log(`Optimal size for ${dimensions.width}x${dimensions.height}: ${optimal.width}x${optimal.height} (${optimal.scale}x scale)`);

    return this.resizeImage(file, {
      width: optimal.width,
      height: optimal.height,
      strategy: 'cover',
      backgroundColor: '#f8f9fa',
      quality: 0.95
    });
  }

  /**
   * Resize image with different strategies while maintaining aspect ratio
   */
  async resizeImage(file: File, options: ResizeOptions): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = options.width;
        canvas.height = options.height;

        if (ctx) {
          // Fill background if specified
          if (options.backgroundColor) {
            ctx.fillStyle = options.backgroundColor;
            ctx.fillRect(0, 0, options.width, options.height);
          }

          const dimensions = this.calculateDimensions(
            img.width,
            img.height,
            options.width,
            options.height,
            options.strategy
          );

          ctx.drawImage(
            img,
            dimensions.sx,
            dimensions.sy,
            dimensions.sWidth,
            dimensions.sHeight,
            dimensions.dx,
            dimensions.dy,
            dimensions.dWidth,
            dimensions.dHeight
          );
        }

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        }, file.type, options.quality || 0.9);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate dimensions based on resize strategy
   */
  private calculateDimensions(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number,
    strategy: 'cover' | 'contain' | 'fill'
  ) {
    switch (strategy) {
      case 'cover':
        return this.calculateCoverDimensions(sourceWidth, sourceHeight, targetWidth, targetHeight);
      case 'contain':
        return this.calculateContainDimensions(sourceWidth, sourceHeight, targetWidth, targetHeight);
      case 'fill':
        return this.calculateFillDimensions(sourceWidth, sourceHeight, targetWidth, targetHeight);
      default:
        return this.calculateContainDimensions(sourceWidth, sourceHeight, targetWidth, targetHeight);
    }
  }

  /**
   * Cover strategy: Crop image to fill entire target area (may crop parts of image)
   * Similar to CSS object-fit: cover
   */
  private calculateCoverDimensions(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number
  ) {
    const sourceAspect = sourceWidth / sourceHeight;
    const targetAspect = targetWidth / targetHeight;

    let sx = 0, sy = 0, sWidth = sourceWidth, sHeight = sourceHeight;

    if (sourceAspect > targetAspect) {
      // Source is wider, crop width
      sWidth = sourceHeight * targetAspect;
      sx = (sourceWidth - sWidth) / 2;
    } else {
      // Source is taller, crop height
      sHeight = sourceWidth / targetAspect;
      sy = (sourceHeight - sHeight) / 2;
    }

    return {
      sx, sy, sWidth, sHeight,
      dx: 0, dy: 0, dWidth: targetWidth, dHeight: targetHeight
    };
  }

  /**
   * Contain strategy: Fit entire image within target area (may have empty space)
   * Similar to CSS object-fit: contain
   */
  private calculateContainDimensions(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number
  ) {
    const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
    const dWidth = sourceWidth * scale;
    const dHeight = sourceHeight * scale;
    const dx = (targetWidth - dWidth) / 2;
    const dy = (targetHeight - dHeight) / 2;

    return {
      sx: 0, sy: 0, sWidth: sourceWidth, sHeight: sourceHeight,
      dx, dy, dWidth, dHeight
    };
  }

  /**
   * Fill strategy: Stretch image to fill target area (may distort aspect ratio)
   * Similar to CSS object-fit: fill
   */
  private calculateFillDimensions(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number
  ) {
    return {
      sx: 0, sy: 0, sWidth: sourceWidth, sHeight: sourceHeight,
      dx: 0, dy: 0, dWidth: targetWidth, dHeight: targetHeight
    };
  }

  /**
   * Convenience method for square images with cover strategy
   */
  async resizeToSquareCover(file: File, size: number = 280): Promise<File> {
    return this.resizeImage(file, {
      width: size,
      height: size,
      strategy: 'cover',
      quality: 0.9
    });
  }

  /**
   * Convenience method for square images with contain strategy
   */
  async resizeToSquareContain(file: File, size: number = 280, backgroundColor: string = '#f8f9fa'): Promise<File> {
    return this.resizeImage(file, {
      width: size,
      height: size,
      strategy: 'contain',
      backgroundColor,
      quality: 0.9
    });
  }

  /**
   * Resize to product ratio (4:3 landscape or 3:4 portrait based on original)
   */
  async resizeToProductRatio(file: File, maxWidth: number = 320): Promise<File> {
    const dimensions = await this.getImageDimensions(file);
    const isPortrait = dimensions.height > dimensions.width;

    const width = maxWidth;
    const height = isPortrait
      ? Math.round(width * 4 / 3) // 3:4 ratio for portrait
      : Math.round(width * 3 / 4); // 4:3 ratio for landscape

    return this.resizeImage(file, {
      width,
      height,
      strategy: 'cover',
      quality: 0.9
    });
  }
}