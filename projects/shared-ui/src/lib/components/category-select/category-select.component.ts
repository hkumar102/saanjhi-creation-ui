import {
    ChangeDetectionStrategy,
    Component,
    forwardRef,
    inject,
    signal,
    output,
    input
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    FormControl,
    ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import {
    CategoryServiceClient,
    CategoryDto,
    ToastService
} from '@saanjhi-creation-ui/shared-common';
import { UiAutocompleteComponent } from '../ui-autocomplete/ui-autocomplete.component';

@Component({
    selector: 'saanjhi-ui-category-select',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AutoCompleteModule,
        UiAutocompleteComponent
    ],
    template: `
        <!-- Single Select AutoComplete -->
        <saanjhi-ui-autocomplete 
        [formControl]="control" 
        optionLabel="name" 
        optionValue="id" 
        [suggestions]="categories()" 
        [dropdown]="true" 
        [multiple]="multiple()"
        [forceSelection]="true"
        (completeMethod)="onSearch($event)"
        (onSelect)="handleAutoCompleteSelect($event)"
        (onUnselect)="handleAutoCompleteSelect($event)"
        [placeholder]="'Select Category'"
        styleClass="w-full"></saanjhi-ui-autocomplete>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CategorySelectComponent),
            multi: true
        }
    ]
})
export class CategorySelectComponent implements ControlValueAccessor {
    private categoryClient = inject(CategoryServiceClient);
    private toast = inject(ToastService);

    private pendingValue: any = null;
    //Input properties
    multiple = input<boolean>(false);
    // Output properties
    categorySelected = output<CategoryDto | CategoryDto[] | null>();

    // Internal state
    categories = signal<CategoryDto[]>([]); // Filtered categories for display
    control = new FormControl<CategoryDto[] | CategoryDto | null>({ value: this.multiple() ? [] : null, disabled: false });

    // ControlValueAccessor implementation
    public onChange = (value: any) => { };
    private onTouched = () => { };

    async ngOnInit() {
        await this.loadAllCategories();
    }

    writeValue(value: any): void {
        this.control.setValue(value);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.control.disable({ emitEvent: false });
        } else {
            this.control.enable({ emitEvent: false });
        }
    }

    // Load all categories once (up to 100 items)
    async loadAllCategories() {
        try {
            const query = {
                pageSize: 100, // Load up to specified limit (default 100)
                sortBy: 'name',
                sortDesc: false
            };

            const result = await this.categoryClient.getAllSimple(query);
            const categories = result || [];

            this.categories.set([...categories]); // Initially show all categories (create new array)

            if (this.pendingValue !== null) {
                this.writeValue(this.pendingValue);
                this.pendingValue = null;
            }

        } catch (error) {
            this.toast.error('Failed to load categories');
            this.categories.set([]);
        }
    }

    // Local search/filter categories
    private filterCategories(searchTerm: string) {
        const allCats = this.categories();

        if (!searchTerm || searchTerm.trim() === '') {
            this.categories.set([...allCats]); // Create new array reference
            return;
        }

        const filtered = allCats.filter(category => {
            const term = searchTerm.toLowerCase();
            const nameMatch = category.name?.toLowerCase().includes(term) || false;
            const descMatch = category.description?.toLowerCase().includes(term) || false;
            return nameMatch || descMatch;
        });

        this.categories.set(filtered); // Filtered array is already new
    }

    // Search handler for AutoComplete - perform local filtering
    onSearch(event: any) {
        const query = event.query || '';
        this.filterCategories(query);
    }

    handleAutoCompleteSelect(event: CategoryDto | CategoryDto[]) {
        this.categorySelected.emit(event);
        if (event) {
            if (this.multiple()) {
                this.onChange((event as CategoryDto[]).map(p => p.id));
            } else {
                this.onChange((event as CategoryDto).id);
            }
        }
    }
}