import { Directive, inject } from '@angular/core';
import { MessageFormatterService, ToastService } from '../services';
import { AppMessages } from '../constants';
import { Subject } from 'rxjs/internal/Subject';

@Directive()
export abstract class BaseComponent {
    protected destroy$ = new Subject<void>();
    protected formatter = inject(MessageFormatterService);
    protected toast = inject(ToastService);

    Messages = AppMessages.application;
    protected readonly ConfirmationMessages = AppMessages.application.confirmation;
    protected readonly HttpMessages = AppMessages.application.errors.http;
    protected readonly ValidationMessages = AppMessages.application.errors.validation;
} 