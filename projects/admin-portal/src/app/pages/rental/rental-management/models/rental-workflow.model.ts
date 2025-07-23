import { RentalStatus, RentalTimelineDto } from "@saanjhi-creation-ui/shared-common";

export interface RentalStatusRequest {
    notes: string;
    status: RentalStatus;
}

export interface RentalBookingRequest extends RentalStatusRequest { }
export interface RentalDeliveredRequest extends RentalStatusRequest {
    actualStartDate: string;
}
export interface RentalReturnedRequest extends RentalStatusRequest {
    actualReturnDate: string;
}
export interface RentalCancelledRequest extends RentalStatusRequest { }
export interface RentalOverdueRequest extends RentalStatusRequest { }
