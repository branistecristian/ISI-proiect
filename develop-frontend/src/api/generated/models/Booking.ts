/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Booking = {
    id?: string;
    userId: string;
    type: Booking.type;
    itemId: string;
    startDate: string;
    endDate: string;
    status: Booking.status;
    createdAt: string;
    updatedAt: string;
};
export namespace Booking {
    export enum type {
        ISLAND = 'ISLAND',
        JET = 'JET',
    }
    export enum status {
        PENDING = 'PENDING',
        CONFIRMED = 'CONFIRMED',
        REJECTED = 'REJECTED',
        CANCELLED = 'CANCELLED',
    }
}

