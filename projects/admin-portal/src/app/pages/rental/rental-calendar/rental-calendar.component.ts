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
        timeZone: 'UTC',
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

    }

    async loadCalendarEvents(start: Date, end: Date): Promise<void> {
        const query: GetRentalsQuery = {
            page: 1,
            pageSize: 1000,
            fromDate: start.toISOString(),
            toDate: end.toISOString(),
        };
        try {
            const result = await this.rentalServiceClient.getRentals(query);
            const events = this.mapRentalsToEvents(result.items || [], start, end);
            this.calendarOptions.events = events;
        } catch (err) {
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
            const startDate = item.actualStartDate?.toDateOnly() ?? item.startDate.toDateOnly();
            const endDate = item.actualReturnDate?.toDateOnly() ?? item.endDate.toDateOnly();
            // Delivery (blue)
            if (
                item.status === RentalStatus.Booked &&
                startDate && this.isInRange(startDate, start, end)
            ) {
                events.push({
                    title: `${title}`,
                    date: startDate,
                    color: 'blue',
                    extendedProps: { item }
                });
            }
            // Return (green)
            if (
                item.status === RentalStatus.PickedUp &&
                endDate && this.isInRange(endDate, start, end)
            ) {
                events.push({
                    title: `${title}`,
                    // start: this.formatDate(endDate),
                    date: endDate,
                    color: 'green',
                    extendedProps: { item }
                });
            }
            // Completed (orange)
            if (
                item.status === RentalStatus.Returned &&
                endDate && this.isInRange(endDate, start, end)
            ) {
                events.push({
                    title: `${title}`,
                    start: startDate,
                    end: this.formatDateExclusiveEnd(endDate),
                    color: 'orange',
                    extendedProps: { item }
                });
            }

            // Overdue (Red)
            if (
                item.status === RentalStatus.Overdue &&
                endDate && this.isInRange(endDate, start, end)
            ) {
                events.push({
                    title: `${title}`,
                    start: startDate,
                    end: this.formatDateExclusiveEnd(endDate),
                    color: 'red',
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

    formatDate(date: string | Date): string | Date {
        let dateStr = `${date}T00:00:00`; // FullCalendar uses 00:00:00 for exclusive end
       
        // If it's a Date object, format as YYYY-MM-DD
        const d = new Date(dateStr);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    formatDateExclusiveEnd(date: string): string {
        let dateStr = `${date}T00:00:00`; // FullCalendar uses 00:00:00 for exclusive end
        
        // Parse date string or Date object
        const d = new Date(dateStr);

        // Add one day
        d.setDate(d.getDate() + 1);

        // Format as 'YYYY-MM-DDTHH:mm:ss'
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd}`;
    }

    handleEventClick(arg: any): void {
        // TODO: Show rental details modal or tooltip
        if (arg && arg.event && arg.event.extendedProps && arg.event.extendedProps.item) {
            const rental = arg.event.extendedProps.item as RentalDto;
            this.navigation.goToRentalManage(rental.id);
        }
    }
}