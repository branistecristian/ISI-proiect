/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingResponse } from '../models/BookingResponse';
import type { CreateBookingRequest } from '../models/CreateBookingRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BookingControllerService {
    /**
     * @param requestBody
     * @returns BookingResponse OK
     * @throws ApiError
     */
    public static create(
        requestBody: CreateBookingRequest,
    ): CancelablePromise<BookingResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/bookings',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns BookingResponse OK
     * @throws ApiError
     */
    public static cancel(
        id: string,
    ): CancelablePromise<BookingResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/bookings/{id}/cancel',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns BookingResponse OK
     * @throws ApiError
     */
    public static mine(): CancelablePromise<Array<BookingResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/bookings/mine',
        });
    }
}
