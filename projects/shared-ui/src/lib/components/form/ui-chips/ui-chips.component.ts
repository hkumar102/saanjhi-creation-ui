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
import { ChipsModule } from 'primeng/chips';

@Component({
    selector: 'saanjhi-ui-chips',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ChipsModule
    ],
    template: `
        <p-chips 
            [id]="inputId()"
            [placeholder]="placeholder()"
            [disabled]="disabled()"
            [allowDuplicate]="allowDuplicate()"
            [separator]="separator()"
            [max]="max()"
            [addOnTab]="addOnTab()"
            [addOnBlur]="addOnBlur()"
            [class]="'w-full ' + styleClass()"
            [ngModel]="value"
            (ngModelChange)="onModelChange($event)"
            (onAdd)="onAdd($event)"
            (onRemove)="onRemove($event)"
            (onFocus)="onFocus($event)"
            (onBlur)="onBlur($event)"
            (onChipClick)="onChipClick($event)">
        </p-chips>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UiChipsComponent),
            multi: true
        }
    ]
})
export class UiChipsComponent implements ControlValueAccessor {
    // Input properties
    inputId = input<string>('');
    styleClass = input<string>('');
    placeholder = input<string>('');
    disabled = input<boolean>(false);
    allowDuplicate = input<boolean>(false);
    separator = input<string>(',');
    max = input<number | undefined>(undefined);
    addOnTab = input<boolean>(true);
    addOnBlur = input<boolean>(true);

    // Internal value
    value: string[] | null = null;

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

    onAdd(event: any): void {
        // Optional: handle add event
    }

    onRemove(event: any): void {
        // Optional: handle remove event
    }

    onFocus(event: any): void {
        this.onTouched();
    }

    onBlur(event: any): void {
        this.onTouched();
    }

    onChipClick(event: any): void {
        // Optional: handle chip click event
    }
}
