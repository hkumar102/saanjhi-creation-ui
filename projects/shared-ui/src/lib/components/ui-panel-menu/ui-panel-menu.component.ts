import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu'
@Component({
  selector: 'saanjhi-ui-panel-menu',
  templateUrl: './ui-panel-menu.component.html',
  styleUrls: ['./ui-panel-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [PanelMenuModule],
})
export class UiPanelMenuComponent {
  /** Items for the panel menu */
  @Input() model: MenuItem[] = [];

  /** Whether multiple panels can be open at once */
  @Input() multiple: boolean = true;
}
