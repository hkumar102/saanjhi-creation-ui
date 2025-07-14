import {
    ChangeDetectionStrategy,
    Component,
    forwardRef,
    input,
    signal
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
    selector: 'saanjhi-ui-dropdown',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        AutoCompleteModule
    ],
    template: `
        <p-autoComplete
            [id]="inputId()"
            [suggestions]="filteredOptions()"
            [field]="optionLabel()"
            [disabled]="disabled()"
            [forceSelection]="true"
            [dropdown]="true"
            [showClear]="showClear()"
            [inputId]="inputId()"
            [styleClass]="'w-full ' + styleClass()"
            [ngModel]="value"
            (ngModelChange)="onModelChange($event)"
            (completeMethod)="onSearch($event)"
            (onDropdownClick)="onDropdownClick()"
            (onFocus)="onFocus($event)"
            (onBlur)="onBlur($event)">
            <ng-template pTemplate="item" let-option>
                <span>{{ option[optionLabel()] }}</span>
            </ng-template>
        </p-autoComplete>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UiDropdownComponent),
            multi: true
        }
    ]
})
export class UiDropdownComponent implements ControlValueAccessor {
    // Input properties
    inputId = input<string>('');
    styleClass = input<string>('');
    options = input<any[]>([]);
    optionLabel = input<string>('label');
    showClear = input<boolean>(false);
    placeholder = input<string>('');
    disabled = input<boolean>(false);

    // Internal value
    value: any = null;
    filteredOptions = signal<any[]>([]);

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

    // Search handler for AutoComplete - perform local filtering
    onSearch(event: any) {
        const query = event.query || '';
        this.filterOptions(query);
    }

    // Dropdown click handler - show all options
    onDropdownClick() {
        this.filteredOptions.set([...this.options()]);
    }

    // Local search/filter options
    private filterOptions(searchTerm: string) {
        const allOptions = this.options();
        if (!searchTerm || searchTerm.trim() === '') {
            this.filteredOptions.set([...allOptions]);
            return;
        }
        const term = searchTerm.toLowerCase();
        const filtered = allOptions.filter(option => {
            const label = option[this.optionLabel()]?.toLowerCase() || '';
            return label.includes(term);
        });
        this.filteredOptions.set(filtered);
    }

    // Event handlers
    onModelChange(value: any): void {
        this.value = value;
        this.onChange(this.value);
    }

    onFocus(event: any): void {
        this.onTouched();
    }

    onBlur(event: any): void {
        this.onTouched();
    }
}
