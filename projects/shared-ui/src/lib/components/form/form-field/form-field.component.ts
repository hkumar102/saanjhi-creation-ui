import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'saanjhi-ui-form-field',
  templateUrl: './form-field.component.html',
  standalone: true
})
export class UiFormFieldComponent  implements OnInit{
  @Input() label: string = '';
  @Input() id: string = '';

  ngOnInit(): void {
    if (!this.id) {
      this.id = `field-${Math.random().toString(36).substring(2, 10)}`;
    }
  }
}
