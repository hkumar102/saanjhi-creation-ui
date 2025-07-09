import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationService } from './services/navigation.service';
import { AppEvent, AuthService, EVENT_TYPES, EventEmitterService, UserContextService } from '@saanjhi-creation-ui/shared-common';
import { Subscription } from 'rxjs';
import { LayoutComponent } from '@saanjhi-creation-ui/shared-ui';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App implements OnInit, OnDestroy {
  private eventEmitter: EventEmitterService = inject(EventEmitterService);
  private navigation = inject(NavigationService);
  private userContext = inject(UserContextService);
  private authService = inject(AuthService);

  private subs = new Subscription();

  isLoggedIn = this.userContext.isAuthenticated;

  async ngOnInit() {
    this.subs.add(
      this.eventEmitter.events.subscribe(async (event: AppEvent) => {
        if (event.type === EVENT_TYPES.LOGOUT) {
          await this.authService.logout();
          this.navigation.goToLogin();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
