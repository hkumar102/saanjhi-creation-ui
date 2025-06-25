import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiLoaderService } from '@saanjhi-creation-ui/shared-common'
/**
 * Fullscreen overlay loader shown when LoaderService signals activity.
 */
@Component({
  selector: 'saanjhi-ui-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-loader.component.html',
  styleUrls: ['./ui-loader.component.scss']
})
export class UiLoaderComponent {
  private loaderService = inject(UiLoaderService);
  readonly visible = computed(() => this.loaderService.isLoading() > 0);
}
