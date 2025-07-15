import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ProductWorkflowService } from '../services/product-workflow.service';
import { Subject, takeUntil } from 'rxjs';
import { ProductWorkflowState, WorkflowEvent } from '../models/product-workflow.models';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
    selector: '',
    template: '',
})
export abstract class BaseProductFlowComponent implements OnInit, OnDestroy {
    protected workflowService = inject(ProductWorkflowService);
    protected destroy$ = new Subject<void>();
    protected route = inject(ActivatedRoute);
    protected router = inject(Router);

    ngOnInit(): void {
        this.workflowService.events$
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
                if (event?.type === 'DATA_INITIALIZED') {
                    this.onWorkflowDataInitialized(event.data);
                }
                else {
                    if (event?.type === 'SAVE_DRAFT') {
                        const productId = this.route.snapshot.paramMap.get('id');
                        if (!productId) {
                            const workflowState = this.workflowService.state();
                            this.router.navigate(['/products/edit', workflowState.productId]);
                        }
                    }
                    this.onWorkFlowEvent(event);
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Child classes can override this to handle workflow events
    protected onWorkflowDataInitialized(data: ProductWorkflowState): void {
        // Default: do nothing
    }

    protected onWorkFlowEvent(event: WorkflowEvent | null): void {
        // Default: do nothing
    }
}