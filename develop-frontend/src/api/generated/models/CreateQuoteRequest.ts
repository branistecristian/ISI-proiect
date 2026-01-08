/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateQuoteRequest = {
    type: CreateQuoteRequest.type;
    islandId?: string;
    jetId?: string;
    name: string;
    email: string;
    message?: string;
};
export namespace CreateQuoteRequest {
    export enum type {
        ISLAND = 'ISLAND',
        JET = 'JET',
    }
}

