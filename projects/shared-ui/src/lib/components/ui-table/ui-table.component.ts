import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { BaseFormControl } from '../base-form-control';

/**
 * A shared wrapper around PrimeNG's p-table, providing a reusable table component
 * with simplified inputs and consistent styling.
 */
@Component({
  selector: 'saanjhi-ui-table',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './ui-table.component.html',
  styleUrls: ['./ui-table.component.scss'],
  host: {
    class: 'saanjhi-component'
  }
})
export class UiTableComponent<T = any> extends BaseFormControl {
  /**
   * Array of records to display in the table.
   */
  @Input() value: T[] = [];
}
