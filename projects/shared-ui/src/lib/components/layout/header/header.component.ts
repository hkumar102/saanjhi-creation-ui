import { CommonModule } from '@angular/common';
import { Component, inject, Input, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent } from "../../ui-button/ui-button.component";
import { EVENT_TYPES, EventEmitterService } from '@saanjhi-creation-ui/shared-common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'saanjh-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, FormsModule, UiButtonComponent, RouterLink]
})
export class HeaderComponent {
  private eventEmitter = inject(EventEmitterService);

  @Input() isLoggedIn!: Signal<boolean>;
  onLogout() {
    this.eventEmitter.emitEvent(EVENT_TYPES.LOGOUT);
  }
}
