/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BookingResponse = {
    id: string;
    userId: string;
    type: BookingResponse.type;
    itemId: string;
    startDate: string;
    endDate: string;
    status: BookingResponse.status;
    createdAt: string;
    updatedAt: string;
};
export namespace BookingResponse {
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

