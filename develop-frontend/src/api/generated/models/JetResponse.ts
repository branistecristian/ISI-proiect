/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type JetResponse = {
    id: string;
    model: string;
    capacity: number;
    rangeKm: number;
    pricePerHour?: number;
    images: Array<string>;
    status: JetResponse.status;
};
export namespace JetResponse {
    export enum status {
        AVAILABLE = 'AVAILABLE',
        BOOKED = 'BOOKED',
        MAINTENANCE = 'MAINTENANCE',
    }
}

