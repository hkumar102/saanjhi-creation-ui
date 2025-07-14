import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserServiceClient, UserContextService, ToastService, Role, MediaServiceClient, MediaType, UserDto } from '@saanjhi-creation-ui/shared-common';
import { UiFileuploadComponent, UiButtonComponent, UiFormErrorComponent, UiFormFieldComponent, UiInputComponent, UiMultiselectComponent } from '@saanjhi-creation-ui/shared-ui';

@Component({
    selector: 'admin-update-profile',
    standalone: true,
    templateUrl: './update-profile.component.html',
    styleUrls: ['./update-profile.component.scss'],
    imports: [
        // Angular modules
        ReactiveFormsModule,
        // Shared UI components
        UiInputComponent,
        UiButtonComponent,
        UiFormFieldComponent,
        UiFormErrorComponent,
        UiMultiselectComponent,
        UiFileuploadComponent
    ],
})
export class UpdateProfileComponent implements OnInit {
    private fb = inject(FormBuilder);
    private userService = inject(UserServiceClient);
    private currentUserService = inject(UserContextService);
    private toastService = inject(ToastService);
    // private roleService = inject(RoleServiceClient);
    private mediaService = inject(MediaServiceClient);

    roles: Role[] = [];

    profileForm: FormGroup = this.fb.group({
        displayName: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
        photoUrl: this.fb.control('', { nonNullable: false }),
        phoneNumber: this.fb.control('', { nonNullable: false }),
        roles: this.fb.control([], { nonNullable: true }),
        providers: this.fb.control([], { nonNullable: true })
    });

    async ngOnInit() {
        const userId = this.currentUserService.userId;
        try {
            const user = await this.userService.getUser(userId!);
            this.profileForm.patchValue(user!);
            //this.roles = await this.roleService.getAllRoles();
        } catch (error) {

        }
    }

    async onFileChosen(files: File[]) {
        if (!files.length) return;

        const file = files[0];
        // const result = await this.mediaService.upload(file, MediaType.Image);
        // this.profileForm.patchValue({ photoUrl: result.url });
    }

    async onSubmit() {
        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            return;
        }

        const updatedUser: UserDto = {
            ...this.profileForm.getRawValue(),
            firebaseUserId: this.currentUserService.firebaseUserId,
            email: this.currentUserService.email,
            id: this.currentUserService.userId!,
        };

        await this.userService.updateUser(updatedUser);
        this.toastService.success('Profile updated successfully');
    }
}
