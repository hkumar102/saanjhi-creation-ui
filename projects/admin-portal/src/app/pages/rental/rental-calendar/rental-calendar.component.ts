import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, EventInput, DatesSetArg } from '@fullcalendar/core';
import { GetRentalsQuery, RentalDto, RentalServiceClient, RentalStatus } from '@saanjhi-creation-ui/shared-common';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';


@Component({
    selector: 'app-rental-calendar',
    standalone: true,
    imports: [CommonModule, FullCalendarModule],
    templateUrl: './rental-calendar.component.html',
    styleUrls: ['./rental-calendar.component.scss']
})
export class RentalCalendarComponent extends AdminBaseComponent implements OnInit {
    private rentalServiceClient = inject(RentalServiceClient);

    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        events: [],
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
        },
        eventClick: this.handleEventClick.bind(this),
        datesSet: this.handleDatesSet.bind(this),
        height: 'auto',
        dayMaxEvents: 5,
        dayCellContent: (arg) => {
            // arg.date is the date for this cell
            // arg.dayNumberText is the day number as string
            // arg.view.calendar.getEvents() gives all events
            const events = arg.view.calendar.getEvents().filter(e =>
                e.start && e.start.toDateString() === arg.date.toDateString()
            );
            let badge = '';
            if (events.length > 5) {
                badge = `<span class="fc-day-badge">${events.length}</span>`;
            }
            return { html: `<span>${arg.dayNumberText}</span>${badge}` };
        }
    };

    ngOnInit(): void {
        // Load initial month
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        this.loadCalendarEvents(nextMonth, endOfNextMonth);
    }

    async loadCalendarEvents(start: Date, end: Date): Promise<void> {
        const query: GetRentalsQuery = {
            page: 1,
            pageSize: 1000,
            fromDate: start.toISOString(),
            toDate: end.toISOString(),
        };
        try {
            console.log('[RentalCalendar] Querying rentals:', query);
            const result = await this.rentalServiceClient.getRentals(query);
            console.log('[RentalCalendar] Rentals API result:', result);
            const events = this.mapRentalsToEvents(result.items || [], start, end);
            console.log('[RentalCalendar] Mapped events:', events);
            this.calendarOptions.events = events;
        } catch (err) {
            console.error('[RentalCalendar] Error loading rentals:', err);
            this.calendarOptions.events = [];
        }
    }

    handleDatesSet(arg: DatesSetArg): void {
        // arg.start and arg.end are JS Dates for the visible range
        this.loadCalendarEvents(arg.start, arg.end);
    }

    mapRentalsToEvents(items: RentalDto[], start: Date, end: Date): EventInput[] {
        return items.flatMap(item => {
            if (!item.customer || !item.product) {
                console.warn('[RentalCalendar] Skipping rental with missing customer or product:', item);
                return [];  // Skip rentals without customer or product
            }
            const events: EventInput[] = [];
            const title = `${item.customer?.name ?? ''} ${item.customer?.phoneNumber ?? ''} (${item.product?.name ?? ''})`;
            // Delivery (blue)
            if (
                item.status === RentalStatus.Booked &&
                item.startDate && this.isInRange(item.startDate, start, end)
            ) {
                events.push({
                    title: `${title}`,
                    start: this.formatDate(item.actualStartDate ?? item.startDate),
                    end: this.formatDate(item.actualReturnDate ?? item.endDate),
                    color: 'blue',
                    extendedProps: { item }
                });
            }
            // Return (green)
            if (
                item.status === RentalStatus.PickedUp &&
                item.endDate && this.isInRange(item.endDate, start, end)
            ) {
                events.push({
                    title: `${title}`,
                    start: this.formatDate(item.actualStartDate ?? item.startDate),
                    end: this.formatDate(item.actualReturnDate ?? item.endDate),
                    color: 'green',
                    extendedProps: { item }
                });
            }
            // Completed (orange)
            if (
                item.status === RentalStatus.Returned &&
                item.endDate && this.isInRange(item.actualReturnDate ?? item.endDate, start, end)
            ) {
                events.push({
                    title: `${title}`,
                    start: this.formatDate(item.actualStartDate ?? item.startDate),
                    end: this.formatDate(item.actualReturnDate ?? item.endDate),
                    color: 'orange',
                    extendedProps: { item }
                });
            }
            return events;
        });
    }

    isInRange(date: string | Date, start: Date, end: Date): boolean {
        const d = new Date(date);
        return d >= start && d <= end;
    }

    formatDate(date: string | Date): string {
        return new Date(date).toISOString().split('T')[0];
    }

    handleEventClick(arg: any): void {
        // TODO: Show rental details modal or tooltip
        if (arg && arg.event && arg.event.extendedProps && arg.event.extendedProps.item) {
            const rental = arg.event.extendedProps.item as RentalDto;
            this.navigation.goToRentalManage(rental.id);
        }
    }
}