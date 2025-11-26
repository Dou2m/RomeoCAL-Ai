
import { Component, ChangeDetectionStrategy, output } from '@angular/core';

@Component({
  selector: 'app-camera-view',
  templateUrl: './camera-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CameraViewComponent {
  imageCaptured = output<string>();

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        // result is a data URL: "data:image/jpeg;base64,..."
        // We need to extract just the base64 part.
        const base64String = (reader.result as string).split(',')[1];
        this.imageCaptured.emit(base64String);
      };
      reader.readAsDataURL(file);
    }
  }
}
