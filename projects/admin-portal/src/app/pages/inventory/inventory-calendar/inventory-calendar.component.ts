import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InventoryService, InventoryCalendarEvent } from '../services/inventory.service';
import { ProductServiceClient } from '@saanjhi-creation-ui/shared-common';
import { AppCurrencyPipe } from '@saanjhi-creation-ui/shared-common';

interface CalendarEvent extends EventInput {
    id: string;
    title: string;
    start: Date;
    end: Date;
    backgroundColor: string;
    borderColor: string;
    extendedProps: {
        productId: string;
        productName: string;
        customerName: string;
        type: 'rental' | 'maintenance' | 'reserved';
        rentalPrice?: number;
        status: string;
    };
}

@Component({
    selector: 'app-inventory-calendar',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        FullCalendarModule,
        ButtonModule,
        DropdownModule,
        DialogModule,
        TagModule,
        TooltipModule,
        AppCurrencyPipe
    ],
    templateUrl: './inventory-calendar.component.html',
    styles: [`
    .field-group {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--surface-border);
    }

    .field-group:last-child {
      border-bottom: none;
    }

    :host ::ng-deep .fc-event {
      border-radius: 4px;
      border: none !important;
      font-size: 0.8rem;
      padding: 2px 4px;
    }

    :host ::ng-deep .fc-event-title {
      font-weight: 500;
    }

    :host ::ng-deep .fc-day:hover {
      background-color: var(--surface-100);
      cursor: pointer;
    }

    :host ::ng-deep .fc-toolbar-title {
      font-size: 1.5rem !important;
      font-weight: 600 !important;
    }
  `]
})
export class InventoryCalendarComponent implements OnInit {
    private inventoryService = inject(InventoryService);
    private productClient = inject(ProductServiceClient);

    // Calendar configuration
    calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,dayGridDay'
        },
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        events: [],
        eventClick: this.handleEventClick.bind(this),
        dateClick: this.handleDateClick.bind(this),
        eventDrop: this.handleEventDrop.bind(this),
        eventResize: this.handleEventResize.bind(this)
    };

    // Filter options
    productOptions: any[] = [];
    selectedProductFilter = '';

    viewOptions = [
        { label: 'Month View', value: 'dayGridMonth' },
        { label: 'Week View', value: 'timeGridWeek' },
        { label: 'Day View', value: 'dayGridDay' }
    ];
    selectedView = 'dayGridMonth';

    // Dialog properties
    showEventDialog = false;
    showAvailabilityDialog = false;
    selectedEvent: CalendarEvent | null = null;
    selectedDate: Date | null = null;
    availableProducts: any[] = [];

    // Data
    allEvents: CalendarEvent[] = [];

    async ngOnInit() {
        await this.loadData();
        this.setupCalendar();
    }

    private async loadData() {
        await this.inventoryService.loadInventoryData();
        await this.loadProductOptions();
        this.loadCalendarEvents();
    }

    private async loadProductOptions() {
        const products = await this.productClient.getAll({ page: 1, pageSize: 1000 });
        this.productOptions = products.items || [];
    }

    private loadCalendarEvents() {
        const inventory = this.inventoryService.inventory();
        const events: CalendarEvent[] = [];

        inventory.forEach(item => {
            // Add current rentals
            item.currentRentals.forEach(rental => {
                events.push({
                    id: `rental-${rental.id}`,
                    title: `${item.product.name} - ${rental.customer?.name}`,
                    start: new Date(rental.startDate),
                    end: new Date(rental.endDate),
                    backgroundColor: '#10B981',
                    borderColor: '#059669',
                    extendedProps: {
                        productId: item.product.id,
                        productName: item.product.name!,
                        customerName: rental.customer?.name || 'Unknown',
                        type: 'rental' as const,
                        rentalPrice: rental.rentalPrice,
                        status: 'Active'
                    }
                });
            });

            // Add upcoming rentals
            item.upcomingRentals.forEach(rental => {
                events.push({
                    id: `rental-${rental.id}`,
                    title: `${item.product.name} - ${rental.customer?.name}`,
                    start: new Date(rental.startDate),
                    end: new Date(rental.endDate),
                    backgroundColor: '#3B82F6',
                    borderColor: '#2563EB',
                    extendedProps: {
                        productId: item.product.id,
                        productName: item.product.name!,
                        customerName: rental.customer?.name || 'Unknown',
                        type: 'rental' as const,
                        rentalPrice: rental.rentalPrice,
                        status: 'Upcoming'
                    }
                });
            });

            // Add maintenance periods (mock data)
            if (item.maintenanceQuantity > 0) {
                const maintenanceStart = new Date();
                maintenanceStart.setDate(maintenanceStart.getDate() + 7);
                const maintenanceEnd = new Date(maintenanceStart);
                maintenanceEnd.setDate(maintenanceEnd.getDate() + 3);

                events.push({
                    id: `maintenance-${item.product.id}`,
                    title: `${item.product.name} - Maintenance`,
                    start: maintenanceStart,
                    end: maintenanceEnd,
                    backgroundColor: '#F59E0B',
                    borderColor: '#D97706',
                    extendedProps: {
                        productId: item.product.id,
                        productName: item.product.name!,
                        customerName: 'Maintenance Team',
                        type: 'maintenance' as const,
                        status: 'Scheduled'
                    }
                });
            }
        });

        this.allEvents = events;
        this.filterEvents();
    }

    private setupCalendar() {
        this.calendarOptions = {
            ...this.calendarOptions,
            events: this.allEvents
        };
    }

    // Event handlers
    handleEventClick(clickInfo: any) {
        this.selectedEvent = clickInfo.event;
        this.showEventDialog = true;
    }

    handleDateClick(dateClickInfo: any) {
        this.selectedDate = dateClickInfo.date;
        this.checkAvailability(dateClickInfo.date);
        this.showAvailabilityDialog = true;
    }

    handleEventDrop(dropInfo: any) {
        console.log('Event dropped:', dropInfo);
        // Handle event rescheduling
    }

    handleEventResize(resizeInfo: any) {
        console.log('Event resized:', resizeInfo);
        // Handle event duration change
    }

    // Filter methods
    onProductFilter() {
        this.filterEvents();
    }

    onViewChange() {
        this.calendarOptions = {
            ...this.calendarOptions,
            initialView: this.selectedView
        };
    }

    private filterEvents() {
        let filteredEvents = this.allEvents;

        if (this.selectedProductFilter) {
            filteredEvents = this.allEvents.filter(event =>
                event.extendedProps.productId === this.selectedProductFilter
            );
        }

        this.calendarOptions = {
            ...this.calendarOptions,
            events: filteredEvents
        };
    }

    // Availability checking
    private async checkAvailability(date: Date) {
        const inventory = this.inventoryService.inventory();
        this.availableProducts = inventory
            .filter(item => item.availableQuantity > 0)
            .map(item => ({
                id: item.product.id,
                name: item.product.name,
                availableQuantity: item.availableQuantity
            }));
    }

    // Utility methods
    getEventTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            'rental': 'Rental',
            'maintenance': 'Maintenance',
            'reserved': 'Reserved'
        };
        return labels[type] || type;
    }

    getEventTypeSeverity(type: string): 'success' | 'warning' | 'info' | 'danger' {
        const severities: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
            'rental': 'success',
            'maintenance': 'warning',
            'reserved': 'info'
        };
        return severities[type] || 'info';
    }

    getEventTypeIcon(type: string): string {
        const icons: Record<string, string> = {
            'rental': 'pi pi-calendar',
            'maintenance': 'pi pi-wrench',
            'reserved': 'pi pi-lock'
        };
        return icons[type] || 'pi pi-circle';
    }

    formatDateRange(start: Date, end: Date): string {
        const startStr = new Date(start).toLocaleDateString();
        const endStr = new Date(end).toLocaleDateString();
        return `${startStr} - ${endStr}`;
    }

    calculateDays(start: Date, end: Date): number {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = endDate.getTime() - startDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    canExtendRental(): boolean {
        return this.selectedEvent?.extendedProps.type === 'rental' &&
            this.selectedEvent?.extendedProps.status === 'Active';
    }

    // Action methods
    viewFullDetails() {
        // Navigate to rental details page
        this.showEventDialog = false;
    }

    editRental() {
        // Navigate to rental edit form
        this.showEventDialog = false;
    }

    extendRental() {
        // Open rental extension dialog
        this.showEventDialog = false;
    }

    createRental() {
        // Navigate to rental creation form with pre-selected date
        this.showAvailabilityDialog = false;
    }
}