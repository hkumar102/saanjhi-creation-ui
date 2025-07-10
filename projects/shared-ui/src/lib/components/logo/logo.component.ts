import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'saanjhi-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-container" [ngClass]="variant">
      <img [src]="logoSrc" [alt]="alt" [class]="imageClass">
      <span *ngIf="showText" class="logo-text">{{ text }}</span>
    </div>
  `,
  styles: [`
    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .logo-text {
      font-weight: 600;
      color: var(--primary-color, #007bff);
    }
    
    .header { height: 40px; }
    .footer { height: 32px; opacity: 0.8; }
    .card { height: 24px; }
    .large { height: 60px; }
  `]
})
export class LogoComponent {
  @Input() variant: 'header' | 'footer' | 'card' | 'large' = 'header';
  @Input() showText: boolean = true;
  @Input() text: string = 'Saanjhi Creation';
  @Input() alt: string = 'Saanjhi Creation Logo';
  
  get logoSrc(): string {
    const basePath = 'assets/images/';
    switch (this.variant) {
      case 'large': return `${basePath}logo.svg`;
      case 'card': return `${basePath}logo-icon.svg`;
      default: return `${basePath}logo.svg`;
    }
  }
  
  get imageClass(): string {
    return `logo-image ${this.variant}`;
  }
}