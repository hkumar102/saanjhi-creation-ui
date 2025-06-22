import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

/**
 * A shared wrapper around PrimeNG's p-table, providing a reusable table component
 * with simplified inputs and consistent styling.
 */
@Component({
  selector: 'saanjhi-ui-table',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './ui-table.component.html',
  styleUrls: ['./ui-table.component.scss']
})
export class UiTableComponent<T = any> {
  /**
   * Array of records to display in the table.
   */
  @Input() value: T[] = [];

  /**
   * Optional: Define columns using custom templates from parent.
   */
  @Input() columns: any[] = [];

  /**
   * Optional: Show paginator or not.
   */
  @Input() paginator: boolean = false;

  /**
   * Optional: Number of rows per page.
   */
  @Input() rows: number = 10;
}
