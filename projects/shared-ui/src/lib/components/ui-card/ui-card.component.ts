import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'saanjhi-ui-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './ui-card.component.html',
  styleUrls: ['./ui-card.component.scss'],
  host: {
    class: 'saanjhi-component'
  }
})
export class UiCardComponent {
  /**
   * Card title displayed in the header
   */
  @Input() title = '';

  /**
   * Optional image URL to show above the content
   */
  @Input() image = '';

  /**
   * Optional content string
   */
  @Input() content = '';
}
