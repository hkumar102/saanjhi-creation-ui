import { Component, forwardRef, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { BaseFormControl } from '../base-form-control';

@Component({
    selector: 'saanjhi-ui-password',
    templateUrl: './ui-password.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UiPasswordComponent),
            multi: true
        }
    ],
    imports: [PasswordModule],
    host: {
        class: 'saanjhi-component'
    }
})
export class UiPasswordComponent extends BaseFormControl implements ControlValueAccessor {
    @Input() label = '';
    @Input() placeholder = '';
    @Input() feedback: boolean = true;

    value = '';
    onChange = (value: string) => { };
    onTouched = () => { };

    writeValue(value: string): void {
        this.value = value ?? '';
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    handleInput(target: EventTarget | null) {
        const value = target instanceof HTMLInputElement ? target.value : '';
        this.value = value;
        this.onChange(value);
    }
}
