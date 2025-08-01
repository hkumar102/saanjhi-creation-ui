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
            // Delivery (blue)
            if (
                item.status === RentalStatus.Booked &&
                item.startDate && this.isInRange(item.startDate, start, end)
            ) {
                events.push({
                    title: `${title}`,
                    start: this.formatDate(item.actualStartDate ?? item.startDate),
                    end: this.formatDateExclusiveEnd(item.actualReturnDate ?? item.endDate),
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
                    end: this.formatDateExclusiveEnd(item.actualReturnDate ?? item.endDate),
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
                    end: this.formatDateExclusiveEnd(item.actualReturnDate ?? item.endDate),
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

    formatDate(date: string | Date): string | Date {

        // If date is a string like "2025-07-11T00:00:00Z", remove Z from it
        if (typeof date === 'string' && date.endsWith('Z')) {
            const dateStr = date.substring(0, date.indexOf('Z'));
            //console.log('[RentalCalendar] Formatted date:', dateStr);
            return dateStr;
        }
        // If it's a Date object, format as YYYY-MM-DD
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    formatDateExclusiveEnd(date: string | Date): string {
        let dateStr = '';
        if (typeof date === 'string' && date.endsWith('Z')) {
            dateStr = date.substring(0, date.indexOf('Z'));
        }
        // Parse date string or Date object
        const d = typeof dateStr === 'string'
            ? new Date(dateStr)
            : new Date(dateStr);

        // Add one day
        d.setDate(d.getDate() + 1);

        // Format as 'YYYY-MM-DDTHH:mm:ss'
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
    }

    handleEventClick(arg: any): void {
        // TODO: Show rental details modal or tooltip
        if (arg && arg.event && arg.event.extendedProps && arg.event.extendedProps.item) {
            const rental = arg.event.extendedProps.item as RentalDto;
            this.navigation.goToRentalManage(rental.id);
        }
    }
}