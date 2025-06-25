// shared-ui/saanjhi-ui-multiselect/saanjhi-ui-multiselect.component.ts
import { Component, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { BaseFormControl } from '../base-form-control';
@Component({
    selector: 'saanjhi-ui-multiselect',
    templateUrl: './ui-multiselect.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UiMultiselectComponent),
            multi: true
        }
    ],
    standalone: true,
    imports: [MultiSelectModule],
    host: {
        class: 'saanjhi-component'
    }
})
export class UiMultiselectComponent<T = any> extends BaseFormControl implements ControlValueAccessor {
    @Input() options: T[] = [];
    @Input() labelKey: string | undefined = 'label';
    @Input() valueKey: string | undefined = 'value';
    @Input() placeholder = 'Select';
    @Input() disabled = false;

    @Output() selectionChange = new EventEmitter<T[]>();

    value: any[] = [];

    onChange = (value: any[]) => { };
    onTouched = () => { };

    writeValue(obj: any[]): void {
        this.value = obj || [];
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onModelChange(value: any[]): void {
        this.value = value;
        this.onChange(value);
        this.selectionChange.emit(value);
    }
}
