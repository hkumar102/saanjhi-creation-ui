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
import { TextareaModule } from 'primeng/textarea';
@Component({
    selector: 'saanjhi-ui-textarea',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        TextareaModule
    ],
    template: `
        <textarea 
            pTextarea
            [id]="inputId()"
            [placeholder]="placeholder()"
            [disabled]="disabled()"
            [readonly]="readonly()"
            [rows]="rows()"
            [cols]="cols()"
            [class]="'w-full ' + styleClass()"
            [ngModel]="value"
            (ngModelChange)="onModelChange($event)"
            (focus)="onFocus($event)"
            (blur)="onBlur($event)"
            (input)="onInput($event)"
            (keydown)="onKeyDown($event)"
            (keyup)="onKeyUp($event)">
        </textarea>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UiTextareaComponent),
            multi: true
        }
    ]
})
export class UiTextareaComponent implements ControlValueAccessor {
    // Input properties
    inputId = input<string>('');
    styleClass = input<string>('');
    placeholder = input<string>('');
    disabled = input<boolean>(false);
    readonly = input<boolean>(false);
    rows = input<number>(4);
    cols = input<number | undefined>(undefined);

    // Internal value
    value: string | null = null;

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
        this.value = (event.target as HTMLTextAreaElement).value;
        this.onChange(this.value);
    }

    onFocus(event: any): void {
        this.onTouched();
    }

    onBlur(event: any): void {
        this.onTouched();
    }

    onKeyDown(event: any): void {
        // Optional: handle key down events
    }

    onKeyUp(event: any): void {
        // Optional: handle key up events
    }
}
