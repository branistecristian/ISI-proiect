/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Jet = {
    id?: string;
    model: string;
    capacity: number;
    rangeKm: number;
    pricePerHour: number;
    images: Array<string>;
    status: Jet.status;
};
export namespace Jet {
    export enum status {
        AVAILABLE = 'AVAILABLE',
        BOOKED = 'BOOKED',
        MAINTENANCE = 'MAINTENANCE',
    }
}

