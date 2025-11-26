import { Component, ChangeDetectionStrategy, output, ElementRef, viewChild, afterNextRender, OnDestroy } from '@angular/core';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/library';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarcodeScannerComponent implements OnDestroy {
  barcodeScanned = output<string>();
  scanError = output<string>();

  videoElement = viewChild.required<ElementRef<HTMLVideoElement>>('videoElement');
  
  private codeReader = new BrowserMultiFormatReader();
  private controls: IScannerControls | null = null;

  constructor() {
    afterNextRender(() => {
      this.startScanner();
    });
  }

  async startScanner() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      this.controls = await this.codeReader.decodeFromStream(stream, this.videoElement().nativeElement, (result, error, controls) => {
        if (result) {
          controls.stop();
          this.barcodeScanned.emit(result.getText());
        }
        if (error && !(error instanceof DOMException)) { // Ignore 'not found' errors which fire continuously
           console.error(error);
        }
      });
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorMessage = 'Could not access the camera.';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission was denied. Please enable it in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No back camera found on this device.';
      }
      this.scanError.emit(errorMessage);
    }
  }

  ngOnDestroy(): void {
    if (this.controls) {
      this.controls.stop();
      this.controls = null;
    }
  }
}
