// user-form.component.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserServiceClient, CreateUserCommand, UpdateUserCommand } from '@saanjhi-creation-ui/shared-common';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';
import { UiFormFieldComponent, UiInputComponent, UiButtonComponent, UiFormErrorComponent, UiCheckboxComponent } from '@saanjhi-creation-ui/shared-ui';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-user-form',
    standalone: true,
    templateUrl: './user-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiFormFieldComponent,
        UiInputComponent,
        UiButtonComponent,
        UiFormErrorComponent,
        UiCheckboxComponent
    ]
})
export class UserFormComponent extends AdminBaseComponent {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private userService = inject(UserServiceClient);

    form = this.fb.group({
        id: [''],
        displayName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: [''],
        photoUrl: [''],
        isActive: [true],
        emailVerified: [false],
        firebaseUserId: ['', Validators.required]
    });

    isEditMode = false;

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.userService.getUser(id).then(user => {
                this.form.patchValue(user);
                this.isEditMode = true;
            });
        }
    }

    async save(): Promise<void> {
        if (this.form.invalid) return;

        const value = this.form.value;
        if (value.id) {
            const command: UpdateUserCommand = value as UpdateUserCommand;
            try {
                await this.userService.updateUser(command);
                this.toast.success(this.formatter.format(this.ConfirmationMessages.updateSuccess, command.displayName!));
            } catch (error) {
                this.toast.error(this.formatter.format(this.ConfirmationMessages.updateFailed, command.displayName!));
                return;
            }
        } else {
            const command: CreateUserCommand = value as CreateUserCommand;
            try {
                await this.userService.createUser(command);
                this.toast.success(this.formatter.format(this.ConfirmationMessages.createSuccess, command.displayName!));
            } catch (error) {
                this.toast.error(this.formatter.format(this.ConfirmationMessages.createFailed, command.displayName!));
                return;
            }
        }

        this.navigation.goToUsers();
    }
}
