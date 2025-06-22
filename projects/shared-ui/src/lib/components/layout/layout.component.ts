import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'saanjh-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  imports: [HeaderComponent, FooterComponent, RouterOutlet]
})
export class LayoutComponent {}
