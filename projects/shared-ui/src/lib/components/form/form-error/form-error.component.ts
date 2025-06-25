import { Component, Input, computed, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'saanjhi-ui-form-error',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="hasErrors()" class="text-sm text-red-600 mt-1">
      <div *ngFor="let error of errorMessages()">{{ error }}</div>
    </div>
  `,
})
export class UiFormErrorComponent {
    @Input({ required: true }) control!: AbstractControl | null;

    /**
     * Allows custom messages like:
     * { required: 'Email is required.', email: 'Custom email message.' }
     */
    @Input() messages: { [key: string]: string } = {};

    errorMessages(): string[] {
        if (!this.control || !this.control.errors) return [];

        return Object.keys(this.control.errors).map((key) => {

            if (this.messages[key]) return this.messages[key];

            switch (key) {
                case 'required':
                    return 'This field is required.';
                case 'email':
                    return 'Please enter a valid email address.';
                case 'minlength':
                    const reqLen = this.control?.errors?.['minlength']?.requiredLength;
                    return `Minimum length is ${reqLen} characters.`;
                case 'maxlength':
                    const maxLen = this.control?.errors?.['maxlength']?.requiredLength;
                    return `Maximum length is ${maxLen} characters.`;
                case 'pattern':
                    return 'Invalid format.';
                default:
                    return 'Invalid field.';
            }
        });
    }

    hasErrors(): boolean {
        return !!(this.control && this.control.invalid && (this.control.dirty || this.control.touched));
    }
}
