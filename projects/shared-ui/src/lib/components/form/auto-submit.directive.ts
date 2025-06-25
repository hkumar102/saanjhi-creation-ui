import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Directive({
  selector: '[saanjhiAutoSubmit]',
  standalone: true
})
export class UiAutoSubmitDirective {
  @Input() saanjhiAutoSubmit!: FormGroup;
  @Output() formSubmitted = new EventEmitter<void>();

  @HostListener('submit', ['$event'])
  onSubmit(event: Event) {
    event.preventDefault();

    if (this.saanjhiAutoSubmit) {
      this.saanjhiAutoSubmit.markAllAsTouched();

      if (this.saanjhiAutoSubmit.valid) {
        this.formSubmitted.emit();
      }
    }
  }
}
