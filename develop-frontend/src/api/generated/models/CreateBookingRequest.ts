/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateBookingRequest = {
    type: CreateBookingRequest.type;
    islandId?: string;
    jetId?: string;
    startDate: string;
    endDate: string;
    notes?: string;
};
export namespace CreateBookingRequest {
    export enum type {
        ISLAND = 'ISLAND',
        JET = 'JET',
    }
}

