import { Component, OnInit, inject, signal, HostListener, Input, Signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EVENT_TYPES, EventEmitterService, ToastService, UserContextService } from '@saanjhi-creation-ui/shared-common';
import { UiButtonComponent } from '@saanjhi-creation-ui/shared-ui';
import { BrowserMultiFormatReader } from '@zxing/browser';

export interface MenuItem {
  label: string;
  routerLink?: string;
  icon?: string;
  items?: MenuItem[];
  command?: () => void;
}

@Component({
  selector: 'saanjhi-ui-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, UiButtonComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private authService = inject(UserContextService);
  private eventEmitter = inject(EventEmitterService);
  private toastService = inject(ToastService)
  private codeReader = new BrowserMultiFormatReader();

  @Input() isLoggedIn!: Signal<boolean>;

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  // State signals
  isMobileMenuOpen = signal<boolean>(false);
  isSearchOpen = signal<boolean>(false);
  isUserMenuOpen = signal<boolean>(false);
  openSubmenu = signal<string | null>(null);

  // User state
  userName = signal<string>('');
  userEmail = signal<string>('');

  // Counts
  wishlistCount = signal<number>(0);
  cartCount = signal<number>(0);

  // Search
  searchQuery = signal<string>('');
  scanQRCodeButtonLabel = signal<string>('Scan QR Code');
  isScanning = signal<boolean>(false);

  // ✅ Navigation Menu Structure
  navigationMenu: MenuItem[] = [
    // {
    //   label: 'Dashboard',
    //   routerLink: '/dashboard',
    //   icon: 'pi pi-chart-bar'
    // },
    {
      label: 'Products',
      routerLink: '/products',
      icon: 'fa-solid fa-boxes-stacked',
    },
    {
      label: 'Inventory',
      routerLink: '/inventory',
      icon: 'fa-solid fa-warehouse'
    },
    // {
    //   label: 'Categories',
    //   routerLink: '/categories',
    //   icon: 'pi pi-tags'
    // },
    {
      label: 'Customers',
      routerLink: '/customers',
      icon: 'fa-solid fa-users'
    },
    {
      label: 'Rentals',
      routerLink: '/rentals',
      icon: 'fa-solid fa-box-open'
    },
    {
      label: 'Calendar',
      routerLink: '/calendar',
      icon: 'fa-solid fa-calendar-days'
    },
    {
      label: 'Reports',
      routerLink: '/reports',
      icon: 'fa-solid fa-chart-pie'
    }
    // {
    //   label: 'Reports',
    //   icon: 'pi pi-chart-pie',
    //   items: [
    //     {
    //       label: 'Analytics',
    //       routerLink: '/reports',
    //       icon: 'pi pi-chart-bar'
    //     },
    //     {
    //       label: 'Inventory Management',
    //       icon: 'pi pi-box',
    //       items: [
    //         {
    //           label: 'Inventory Dashboard',
    //           routerLink: '/inventory',
    //           icon: 'pi pi-chart-line'
    //         },
    //         {
    //           label: 'Rental Calendar',
    //           routerLink: '/inventory/calendar',
    //           icon: 'pi pi-calendar'
    //         },
    //         {
    //           label: 'Inventory Reports',
    //           routerLink: '/inventory/reports',
    //           icon: 'pi pi-file-chart'
    //         }
    //       ]
    //     }
    //   ]
    // }
  ];

  ngOnInit() {
    this.loadUserState();
  }

  private loadUserState() {
    // Load user authentication state
    if (this.isLoggedIn()) {
      const user = this.authService.user();
      this.userName.set(user?.displayName || '');
      this.userEmail.set(user?.email || '');
    }
  }

  // ✅ Submenu Management
  toggleSubmenu(menuLabel: string, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const currentOpen = this.openSubmenu();
    this.openSubmenu.set(currentOpen === menuLabel ? null : menuLabel);
  }

  isSubmenuOpen(menuLabel: string): boolean {
    return this.openSubmenu() === menuLabel;
  }

  closeAllSubmenus() {
    this.openSubmenu.set(null);
  }

  // ✅ Mobile Menu Management
  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
    if (this.isMobileMenuOpen()) {
      this.closeAllSubmenus();
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
    this.closeAllSubmenus();
  }

  // Search functionality
  toggleSearch() {
    this.isSearchOpen.update(value => !value);
  }

  onSearch() {
    const query = this.searchQuery();
    if (query.trim()) {
      console.log('Searching for:', query);
      // Implement search functionality
    }
  }

  // User menu functionality
  toggleUserMenu() {
    this.isUserMenuOpen.update(value => !value);
  }

  onLogout() {
    this.userName.set('');
    this.userEmail.set('');
    this.isUserMenuOpen.set(false);
    this.closeMobileMenu();
    this.eventEmitter.emitEvent(EVENT_TYPES.LOGOUT);
  }

  // Cart functionality
  toggleCart() {
    console.log('Toggle cart');
    // Implement cart functionality
  }

  // ✅ Close menus when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Close submenus if clicking outside
    if (!target.closest('.nav-item-with-submenu')) {
      this.closeAllSubmenus();
    }

    // Close user menu if clicking outside
    if (!target.closest('.user-menu')) {
      this.isUserMenuOpen.set(false);
    }
  }

  // ✅ Utility method to check if menu item has children
  hasSubmenu(item: MenuItem): boolean {
    return !!(item.items && item.items.length > 0);
  }

  // ✅ Get submenu items
  getSubmenuItems(item: MenuItem): MenuItem[] {
    return item.items || [];
  }

  isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 0;
  }

  onScanQRCode() {
    if (this.isScanning()) {
      this.cancelScan();
      this.toastService.info('QR code scanned canceled');
    } else {
      this.startScan();
    }
  }

  private cancelScan() {
    this.isScanning.set(false);
    this.scanQRCodeButtonLabel.set('Scan QR Code');
    this.video.nativeElement.style.display = 'none';
    const stream = this.video.nativeElement.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      this.video.nativeElement.srcObject = null;
    }
  }

  private startScan() {
    this.isScanning.set(true);
    this.scanQRCodeButtonLabel.set('Cancel Scan');
    this.video.nativeElement.style.display = 'block';
    try {
      this.codeReader.decodeOnceFromVideoDevice(undefined, this.video.nativeElement)
        .then(result => {

          const code = result.getText();
          if (!code) {
            this.toastService.error('Failed to scan QR code');
            return;
          } else {
            this.eventEmitter.emitEvent(EVENT_TYPES.SCANNED_QR_CODE, { code: code });
            this.toastService.success('QR code scanned successfully');
          }
          this.cancelScan();
        })
        .catch(err => {
          this.cancelScan();
          this.toastService.error('Failed to scan QR code');
        });
    } catch (err) {
      this.cancelScan();
      this.toastService.error('Failed to start camera for QR code scanning');
    }
  }
}