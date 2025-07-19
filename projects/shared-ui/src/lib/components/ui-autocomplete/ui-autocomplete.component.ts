import {
    Component,
    forwardRef,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    output,
    ContentChild,
    TemplateRef,
    inject
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
        [ngModel]="primengValue"
        [suggestions]="suggestions"
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
        (ngModelChange)="readValueFromPrimeNg($event)"
        (completeMethod)="completeMethodHandler($event)"
        (onSelect)="selectMethodHandler($event)"
        (onBlur)="onTouched(); onBlur.emit($event)"
        (onClear)="onClear.emit($event)"
        (onUnselect)="onUnselectHandler($event)"
        [unique]="true"
        [styleClass]="styleClass"
        >
            <ng-container *ngIf="headerTemplate">
              <ng-template pTemplate="header">
                <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
              </ng-template>
            </ng-container>
            <ng-container *ngIf="itemTemplate">
              <ng-template pTemplate="item" let-item>
                <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item }"></ng-container>
              </ng-template>
            </ng-container>
            <ng-container *ngIf="selectedItemTemplate">
              <ng-template pTemplate="selectedItem" let-item>
                <ng-container *ngTemplateOutlet="selectedItemTemplate; context: { $implicit: item }"></ng-container>
              </ng-template>
            </ng-container>
            <ng-container *ngIf="footerTemplate">
              <ng-template pTemplate="footer">
                <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
              </ng-template>
            </ng-container>
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
    private cdr = inject(ChangeDetectorRef);

    @ContentChild('item', { static: false }) itemTemplate?: TemplateRef<any>;
    @ContentChild('selectedItem', { static: false }) selectedItemTemplate?: TemplateRef<any>;
    @ContentChild('header', { static: false }) headerTemplate?: TemplateRef<any>;
    @ContentChild('footer', { static: false }) footerTemplate?: TemplateRef<any>;

    @Input() inputId?: string;
    @Input() styleClass?: string;

    private _suggestions: any[] = [];

    @Input()
    set suggestions(value: any[]) {
        this._suggestions = value;
        // Try resolving again if value is a primitive
        if (this.pendingValue) {
            this.sendValueToPrimeNg(this.pendingValue);
            this.pendingValue = null;
        }
    }
    get suggestions(): any[] {
        return this._suggestions;
    }

    @Input() dropdown: boolean = true;
    @Input() multiple: boolean = false;
    @Input() disabled: boolean = false;
    @Input() placeholder?: string;
    @Input() forceSelection: boolean = true;
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
    pendingValue: T | T[] | null | undefined;
    primengValue: T | T[] | null | undefined;

    onChange = (_: any) => { };
    onTouched = () => { };
    control = new FormControl({ value: {}, disabled: false });


    writeValue(obj: any): void {
        if (obj == null) {
            this.value = obj;
            this.primengValue = obj;
            this.cdr.markForCheck(); // Force change detection
            setTimeout(() => {
                this.primengValue = null; // Ensure reference changes for PrimeNG
                this.cdr.markForCheck();
            });
            return;
        }

        if (!this.suggestions || !this.suggestions.length) {
            this.value = obj;
            this.pendingValue = obj;
            return;
        }

        this.sendValueToPrimeNg(obj);
    }

    sendValueToPrimeNg(obj: any): void {
        if (!this.suggestions || !this.suggestions.length) {
            return;
        }

        // Value can be a single object or an array, we just need to handle the case of multiple
        if (this.multiple) {
            //if multiple is true, we need pass object array to value
            if (Array.isArray(obj)) {
                const initialValue = obj as any[];
                //We need to validate if suggestions are available else we cant really set as object
                //but for now we will assume suggestions are available
                if (this.optionValue) {
                    // If optionValue is set, then initialValue will be array of values either string or number
                    this.primengValue = this.suggestions.filter(item => initialValue.includes(item[this.optionValue as keyof T]));
                } else {
                    // If optionValue is not set, we assume initialValue is an array of objects
                    this.primengValue = initialValue;
                }
            }
        } else {
            if (this.optionValue) {
                // If optionValue is set, we need to find the object in suggestions
                this.primengValue = this.suggestions.find(item => item[this.optionValue!] === obj);
            } else {
                this.primengValue = this.suggestions.find(item => item === obj);
            }
        }

        this.value = this.primengValue;
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

    // When Primeng emits we will get either an object or an array of objects depending on multiple
    readValueFromPrimeNg(value: any): void {
        //this.onChange(value);
        //this.sendValueToPrimeNg(value);
    }

    completeMethodHandler(event: any): void {
        this.suggestions = [...this.suggestions];
        this.completeMethod.emit(event);
    }

    selectMethodHandler(selected: AutoCompleteSelectEvent): void {
        this.onTouched();
        let isAnyChangeDetected = false;
        let emittedValue: any;
        if (this.multiple) {
            if (!this.value) {
                this.value = [];
            }
            let selectedObj = selected.value;

            if (this.optionValue) {
                selectedObj = this.suggestions.find(item => item[this.optionValue!] === selected.value[this.optionValue!]);
                // Prevent duplicates by optionValue
                if (!(this.value as any[]).some(item => item[this.optionValue!] === selectedObj[this.optionValue!])) {
                    ((this.value || []) as T[]).push(selectedObj);
                    isAnyChangeDetected = true;
                }
                emittedValue = (this.value as T[]).map(item => item[this.optionValue as keyof T]);
            } else {
                // Prevent duplicates by object reference
                if (!((this.value || []) as T[]).includes(selectedObj)) {
                    ((this.value || []) as T[]).push(selectedObj);
                    isAnyChangeDetected = true;
                }
                emittedValue = (this.value as T[]);
            }
        } else {
            let selectedObj = selected.value;
            this.value = selectedObj;
            emittedValue = selected.value;
            if (this.optionValue) {
                selectedObj = this.suggestions.find(item => item[this.optionValue!] === selected.value[this.optionValue!]);
                emittedValue = selectedObj[this.optionValue!] as any;
            }
            isAnyChangeDetected = true;
        }

        if (isAnyChangeDetected) {
            this.onChange(emittedValue);
            this.onSelect.emit(this.value);
        }

        this.primengValue = Array.isArray(this.value) ? [...this.value] as T[] : this.value as T;

    }

    onUnselectHandler(event: any): void {
        if (this.multiple) {
            this.value = (this.value as T[]).filter(item => item !== event.value);
            if (this.optionValue) {
                this.onChange((this.value as any[]).map(item => item[this.optionValue!]));
            } else {
                this.onChange(this.value);
            }
        }
        this.onTouched();
        this.onUnselect.emit(this.value);
    }
}