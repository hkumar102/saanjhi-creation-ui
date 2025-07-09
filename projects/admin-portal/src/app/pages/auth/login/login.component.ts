import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiInputComponent, UiPasswordComponent, UiButtonComponent, UiFormFieldComponent, UiFormErrorComponent, UiAutoSubmitDirective } from '@saanjhi-creation-ui/shared-ui';
import { AuthService, ToastService } from '@saanjhi-creation-ui/shared-common'; // Assuming AuthService is in shared-ui
import { AppMessages } from '@saanjhi-creation-ui/shared-common';
import { NavigationService } from '../../../services/navigation.service';
import { ActivatedRoute } from '@angular/router';
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
    UiFormFieldComponent,
    UiFormErrorComponent,
    UiAutoSubmitDirective
  ]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private navigationService = inject(NavigationService);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  async onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      await this.authService.login(email, password);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/products';
      this.navigationService.goTo(returnUrl);
    }
  }
}
