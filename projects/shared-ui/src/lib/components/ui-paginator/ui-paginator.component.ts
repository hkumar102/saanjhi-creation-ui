import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'saanjhi-ui-paginator',
  standalone: true,
  imports: [CommonModule, PaginatorModule],
  template: `
    <p-paginator
      [rows]="rows"
      [totalRecords]="totalRecords"
      [rowsPerPageOptions]="rowsPerPageOptions"
      (onPageChange)="onPageChange.emit($event)"
    ></p-paginator>
  `
})
export class UiPaginatorComponent {
  @Input() rows = 10;
  @Input() totalRecords = 0;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20];

  @Output() onPageChange = new EventEmitter<any>();
}