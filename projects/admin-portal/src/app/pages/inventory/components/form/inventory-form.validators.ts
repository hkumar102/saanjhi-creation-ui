import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";

export function retirementFieldRequiredValidator(field: 'retirementReason' | 'retirementDate'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const parent = control.parent;
        if (!parent) return null;
        const isRetired = parent.get('isRetired')?.value;
        if (isRetired && !control.value) {
            return { retirementFieldRequired: true };
        }
        return null;
    };
}

export function sizeAvailableValidator(availableSizes: () => any[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (availableSizes().length === 0) {
            return { noAvailableSizes: true };
        }
        return null;
    };
}

export function colorAvailableValidator(availableColors: () => any[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (availableColors().length === 0) {
            return { noAvailableColors: true };
        }
        return null;
    };
}