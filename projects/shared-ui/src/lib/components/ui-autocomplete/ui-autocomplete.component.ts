import {
    Component,
    forwardRef,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    output
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    FormsModule,
    FormControl
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';

@Component({
    selector: 'saanjhi-ui-autocomplete',
    standalone: true,
    imports: [CommonModule, AutoCompleteModule, FormsModule],
    template: `
        <p-autoComplete
        #autoComplete
        [inputId]="inputId"
        [(ngModel)]="value"
        [suggestions]="suggestions"
        [field]="field"
        [dropdown]="dropdown"
        [multiple]="multiple"
        [disabled]="disabled"
        [placeholder]="placeholder"
        [forceSelection]="forceSelection"
        [completeOnFocus]="completeOnFocus"
        [minLength]="minLength"
        [virtualScroll]="virtualScroll"
        [delay]="delay"
        [optionLabel]="optionLabel"
        [optionValue]="optionValue"
        (ngModelChange)="handleChange($event)"
        (completeMethod)="completeMethodHandler($event)"
        (onSelect)="selectMethodHandler($event)"
        (onBlur)="onTouched(); onBlur.emit($event)"
        (onFocus)="onFocus.emit($event)"
        (onClear)="onClear.emit($event)"
        (onUnselect)="onUnselectHandler($event)"
        (onFocus)="autoComplete.show()"
        [unique]="true"
        [styleClass]="styleClass"
        >
        </p-autoComplete>
  `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UiAutocompleteComponent),
            multi: true
        }
    ]
})
export class UiAutocompleteComponent<T = any>
    implements ControlValueAccessor {
    @Input() inputId?: string;
    @Input() styleClass?: string;
    private _suggestions: any[] = [];

    @Input()
    set suggestions(value: any[]) {
        this._suggestions = value;
        // Try resolving again if value is a primitive
        if (this.optionValue && this.value && typeof this.value !== 'object') {
            const match = this.optionValue
                ? value.find(item => item[this.optionValue as keyof typeof item] === this.value)
                : undefined;
            if (match) {
                this.value = match;
            }
        }
    }
    get suggestions(): any[] {
        return this._suggestions;
    }
    @Input() field?: string;
    @Input() dropdown: boolean = false;
    @Input() multiple: boolean = false;
    @Input() disabled: boolean = false;
    @Input() placeholder?: string;
    @Input() forceSelection: boolean = false;
    @Input() completeOnFocus: boolean = false;
    @Input() minLength: number = 1;
    @Input() virtualScroll: boolean = false;
    @Input() delay: number = 300;
    @Input() optionLabel?: string; // Same as field
    @Input() optionValue?: string; // Optional — supports [optionValue]

    @Output() completeMethod = new EventEmitter<any>();
    @Output() onSelect = new EventEmitter<any>();
    @Output() onBlur = new EventEmitter<any>();
    @Output() onFocus = new EventEmitter<any>();
    @Output() onClear = new EventEmitter<any>();
    @Output() onUnselect = new EventEmitter<any>();

    value!: T | T[] | null | undefined;
    onChange = (_: any) => { };
    onTouched = () => { };
    control = new FormControl({ value: {}, disabled: false });


    writeValue(obj: any): void {
        if (obj == null) {
            this.value = null;
            return;
        }

        if (this.multiple && Array.isArray(obj)) {
            if (this.optionValue && Array.isArray(this.suggestions)) {
                this.value = obj.map(val => {
                    const match = this.suggestions.find(item => item[this.optionValue as keyof T] === val);
                    return match ?? val;
                });
            } else {
                this.value = obj;
            }
        } else if (this.optionValue && Array.isArray(this.suggestions)) {
            const match = this.suggestions.find(item => item[this.optionValue as keyof T] === obj);
            this.value = match ?? obj;
        } else {
            this.value = obj;
        }
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

    handleChange(value: any): void {
        if (this.optionValue && (typeof value !== 'object' || Array.isArray(value))) {
            if (this.multiple && Array.isArray(value)) {
                const resolved = value.map(val =>
                    typeof val === 'object'
                        ? val
                        : this.suggestions.find(opt => opt[this.optionValue!] === val)
                ).filter(v => v);
                this.value = resolved;
            } else {
                this.value = this.suggestions.find(opt => opt[this.optionValue!] === value) ?? value;
            }
        } else {
            this.value = value;
        }

        if (this.optionValue) {
            if (this.multiple && Array.isArray(this.value)) {
                const emittedValues = (this.value as T[]).map(v => v?.[this.optionValue as keyof T]);
                this.onChange(emittedValues);
            } else {
                const emitted = (this.value as T)?.[this.optionValue as keyof T];
                this.onChange(emitted);
            }
        } else {
            this.onChange(this.value);
        }
    }

    completeMethodHandler(event: any): void {
        this.suggestions = [...this.suggestions];
        this.completeMethod.emit(event);
    }

    selectMethodHandler(selected: AutoCompleteSelectEvent): void {
        this.onTouched();
        this.onSelect.emit(this.value);
    }

    onUnselectHandler(event: any): void {
        this.onTouched();
        this.onUnselect.emit(this.value);
    }
}