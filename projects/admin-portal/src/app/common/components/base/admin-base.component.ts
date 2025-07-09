import { ChangeDetectorRef, Directive, inject } from "@angular/core";
import { NavigationService } from "../../../services/navigation.service";
import { BaseComponent } from "@saanjhi-creation-ui/shared-common";

@Directive()
export abstract class AdminBaseComponent extends BaseComponent {
    protected navigation = inject(NavigationService);
    protected cdr = inject(ChangeDetectorRef);
}