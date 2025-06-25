import { Directive, Input, OnInit } from '@angular/core';

@Directive({ standalone: true }) // ✅ Prevents need to declare it in modules
export abstract class BaseFormControl implements OnInit {
    @Input() inputId?: string;
    
    get id(): string {
        return this.inputId || '';
    }

    ngOnInit() {
        if (!this.inputId) {
            this.inputId = `input-${Math.random().toString(36).substring(2, 8)}`;
        }
    }
}