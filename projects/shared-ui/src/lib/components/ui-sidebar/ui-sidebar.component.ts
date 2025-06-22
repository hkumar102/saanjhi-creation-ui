import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';

/**
 * Wrapper for PrimeNG Sidebar (`p-sidebar`).
 * Used in SaanjhiCreation for consistent sidebar behavior and styling.
 */
@Component({
  selector: 'saanjhi-ui-sidebar',
  templateUrl: './ui-sidebar.component.html',
  styleUrls: ['./ui-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SidebarModule]
})
export class UiSidebarComponent {
  /**
   * Controls visibility of the sidebar.
   */
  @Input() visible: boolean = false;

  /**
   * Emits when the sidebar visibility changes (two-way binding).
   */
  @Output() visibleChange = new EventEmitter<boolean>();

  /**
   * Whether to show the sidebar in modal mode.
   * If true, disables page interaction while open.
   */
  @Input() modal: boolean = false;

  /**
   * Controls the base z-index of the sidebar.
   */
  @Input() baseZIndex: number = 1000;

  /**
   * Called when the sidebar requests to close.
   */
  onHide(): void {
    this.visibleChange.emit(false);
  }
}
