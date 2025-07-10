import { Component, HostListener, inject, Input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EVENT_TYPES, EventEmitterService } from '@saanjhi-creation-ui/shared-common';

@Component({
  selector: 'saanjhi-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private eventEmitter = inject(EventEmitterService);

  @Input() isLoggedIn!: Signal<boolean>;
  onLogout() {
    this.closeMobileMenu();
    this.eventEmitter.emitEvent(EVENT_TYPES.LOGOUT);
  }

  isMobileMenuOpen = false;
  isSearchOpen = false;
  isUserMenuOpen = false;
  searchQuery = '';

  // Mock data - replace with your actual service data
  userName = 'John Doe';
  userEmail = 'john@example.com';
  cartCount = 3;
  wishlistCount = 5;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleCart() {
    // Implement cart toggle logic
    console.log('Toggle cart');
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      // Implement search logic
      console.log('Search:', this.searchQuery);
      this.isSearchOpen = false;
    }
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Close user menu if clicking outside
    if (!target.closest('.user-menu')) {
      this.isUserMenuOpen = false;
    }
  }

  // Close mobile menu on window resize
  @HostListener('window:resize')
  onWindowResize() {
    if (window.innerWidth >= 768) {
      this.closeMobileMenu();
    }
  }
}