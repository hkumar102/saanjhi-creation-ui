// scanner.component.ts
import { Component, ViewChild, ElementRef } from '@angular/core';
import { UiButtonComponent } from '@saanjhi-creation-ui/shared-ui';
import { BrowserMultiFormatReader } from '@zxing/browser';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [UiButtonComponent],
  template: `
    <saanjhi-ui-button (click)="startScan()" label="Start Scan">Scan Barcode</saanjhi-ui-button>
    <video #video width="300" height="200" style="display:none;"></video>
    <input type="text" [value]="barcode" readonly>
  `
})
export class BarcodeScannerComponent {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  barcode: string = '';
  private codeReader = new BrowserMultiFormatReader();

  async startScan() {
    this.barcode = '';
    this.video.nativeElement.style.display = 'block';
    try {
      const result = await this.codeReader.decodeOnceFromVideoDevice(undefined, this.video.nativeElement);
      console.log('Barcode scanned:', result.getText());
      this.barcode = result.getText();
    } catch (err) {
      this.barcode = 'Scan failed or cancelled';
    }
    this.video.nativeElement.style.display = 'none';
  }
}