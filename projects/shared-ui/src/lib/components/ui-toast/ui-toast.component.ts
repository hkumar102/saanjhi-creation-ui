import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';

/**
 * Global toast wrapper for displaying app-wide messages.
 */
@Component({
    selector: 'saanjhi-ui-toast',
    standalone: true,
    imports: [ToastModule],
    templateUrl: './ui-toast.component.html',
})
export class UiToastComponent {
}
