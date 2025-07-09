import { Component, Input, Signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { UiToastComponent } from '../ui-toast';
import { UiLoaderComponent } from '@saanjhi-creation-ui/shared-ui';

@Component({
  selector: 'saanjhi-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [HeaderComponent, FooterComponent, RouterOutlet, UiToastComponent, UiLoaderComponent]
})
export class LayoutComponent {
  @Input() isLoggedIn!: Signal<boolean>;
}
