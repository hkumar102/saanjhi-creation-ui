import {
    ChangeDetectionStrategy,
    Component,
    forwardRef,
    input
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    selector: 'saanjhi-ui-input-number',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        InputNumberModule
    ],
    template: `
        <p-inputNumber 
            [id]="inputId()"
            [mode]="mode()"
            [currency]="currency()"
            [locale]="locale()"
            [min]="min()"
            [max]="max()"
            [step]="step()"
            [minFractionDigits]="minFractionDigits()"
            [maxFractionDigits]="maxFractionDigits()"
            [prefix]="prefix()"
            [suffix]="suffix()"
            [placeholder]="placeholder()"
            [disabled]="disabled()"
            [readonly]="readonly()"
            [showButtons]="showButtons()"
            [buttonLayout]="buttonLayout()"
            [incrementButtonClass]="incrementButtonClass()"
            [decrementButtonClass]="decrementButtonClass()"
            [incrementButtonIcon]="incrementButtonIcon()"
            [decrementButtonIcon]="decrementButtonIcon()"
            [allowEmpty]="allowEmpty()"
            [useGrouping]="useGrouping()"
            [class]="'w-full ' + styleClass()"
            [ngModel]="value"
            (ngModelChange)="onModelChange($event)"
            (onInput)="onInput($event)"
            (onFocus)="onFocus($event)"
            (onBlur)="onBlur($event)">
        </p-inputNumber>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UiInputNumberComponent),
            multi: true
        }
    ]
})
export class UiInputNumberComponent implements ControlValueAccessor {
    // Input properties
    inputId = input<string>('');
    styleClass = input<string>('');
    mode = input<'decimal' | 'currency'>('decimal');
    currency = input<string>('USD');
    locale = input<string>('en-US');
    min = input<number | undefined>(undefined);
    max = input<number | undefined>(undefined);
    step = input<number>(1);
    minFractionDigits = input<number | undefined>(undefined);
    maxFractionDigits = input<number | undefined>(undefined);
    prefix = input<string>('');
    suffix = input<string>('');
    placeholder = input<string>('');
    disabled = input<boolean>(false);
    readonly = input<boolean>(false);
    showButtons = input<boolean>(false);
    buttonLayout = input<'stacked' | 'horizontal' | 'vertical'>('stacked');
    incrementButtonClass = input<string>('');
    decrementButtonClass = input<string>('');
    incrementButtonIcon = input<string>('pi pi-angle-up');
    decrementButtonIcon = input<string>('pi pi-angle-down');
    allowEmpty = input<boolean>(true);
    useGrouping = input<boolean>(true);

    // Internal value
    value: number | null = null;

    // ControlValueAccessor implementation
    private onChange = (value: any) => { };
    private onTouched = () => { };

    writeValue(value: any): void {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        // This will be handled by the disabled input property
    }

    // Event handlers
    onModelChange(value: any): void {
        this.value = value;
        this.onChange(this.value);
    }

    onInput(event: any): void {
        this.value = event.value;
        this.onChange(this.value);
    }

    onFocus(event: any): void {
        this.onTouched();
    }

    onBlur(event: any): void {
        this.onTouched();
    }

    onKeyDown(event: any): void {
        // Optional: handle key events
    }

    onClear(event: any): void {
        this.value = null;
        this.onChange(this.value);
    }
}
