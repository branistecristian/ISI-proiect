/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Booking } from '../models/Booking';
import type { BookingUpdateRequest } from '../models/BookingUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminBookingControllerService {
    /**
     * @param id
     * @param requestBody
     * @returns Booking OK
     * @throws ApiError
     */
    public static updateBooking(
        id: string,
        requestBody: BookingUpdateRequest,
    ): CancelablePromise<Booking> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/admin/bookings/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteBooking(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/admin/bookings/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns Booking OK
     * @throws ApiError
     */
    public static updateBookingStatus(
        id: string,
        requestBody: Record<string, string>,
    ): CancelablePromise<Booking> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/admin/bookings/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns Booking OK
     * @throws ApiError
     */
    public static getAllBookings(): CancelablePromise<Array<Booking>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/bookings',
        });
    }
}
