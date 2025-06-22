import { Component } from '@angular/core';

@Component({
  selector: 'saanjh-footer',
  standalone: true,
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  year = new Date().getFullYear();
}