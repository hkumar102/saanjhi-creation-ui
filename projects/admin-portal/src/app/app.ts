import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationService } from './services/navigation.service';
import { AppEvent, AuthService, EVENT_TYPES, EventEmitterService, InventoryServiceClient, UserContextService } from '@saanjhi-creation-ui/shared-common';
import { Subscription } from 'rxjs';
import { LayoutComponent } from '@saanjhi-creation-ui/shared-ui';
import { AdminBaseComponent } from './common/components/base/admin-base.component';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App extends AdminBaseComponent implements OnInit, OnDestroy {
  private eventEmitter: EventEmitterService = inject(EventEmitterService);
  private userContext = inject(UserContextService);
  private authService = inject(AuthService);
  private inventoryServiceClient = inject(InventoryServiceClient);

  private subs = new Subscription();

  isLoggedIn = this.userContext.isAuthenticated;

  async ngOnInit() {
    this.subs.add(
      this.eventEmitter.events.subscribe(async (event: AppEvent) => {
        if (event.type === EVENT_TYPES.LOGOUT) {
          await this.authService.logout();
          this.navigation.goToLogin();
        }
        else if (event.type === EVENT_TYPES.SCANNED_QR_CODE) {
          // Handle scanned QR code event
          console.log('QR Code scanned:', event.payload?.code);
          const inventoryResult = await this.inventoryServiceClient.search({ serialNumber: event.payload?.code });
          if (inventoryResult.totalCount > 0) {
            const inventoryItem = inventoryResult.items.find(item => item.serialNumber === event.payload?.code);
            if (inventoryItem) {
              this.navigation.goTo(`/inventory/details/${inventoryItem.id}`);
            } else {
              this.toast.error(`No inventory item found for the scanned QR code ${event.payload?.code}`);
            }
          } else {
            this.toast.error(`No inventory item found for the scanned QR code ${event.payload?.code}`);
          }
          // You can add logic to handle the scanned QR code here
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
