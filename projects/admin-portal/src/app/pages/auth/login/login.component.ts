import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiInputComponent, UiPasswordComponent, UiButtonComponent, UiFormFieldComponent } from '@saanjhi-creation-ui/shared-ui';
import { AuthService } from '@saanjhi-creation-ui/shared-common'; // Assuming AuthService is in shared-ui
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    // Angular modules
    ReactiveFormsModule,
    // Shared UI wrappers
    UiInputComponent,
    UiPasswordComponent,
    UiButtonComponent,
    UiFormFieldComponent
  ]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  async onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      await this.authService.login(email, password);
    }
  }
}
