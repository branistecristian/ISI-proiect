/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type QuoteResponse = {
    id: string;
    name: string;
    email: string;
    message?: string;
    type: QuoteResponse.type;
    itemId?: string;
    createdAt: string;
    status: QuoteResponse.status;
};
export namespace QuoteResponse {
    export enum type {
        ISLAND = 'ISLAND',
        JET = 'JET',
    }
    export enum status {
        NEW = 'NEW',
        SEEN = 'SEEN',
        RESPONDED = 'RESPONDED',
    }
}

