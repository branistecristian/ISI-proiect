/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AvailabilityResponse } from '../models/AvailabilityResponse';
import type { IslandResponse } from '../models/IslandResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PublicIslandsControllerService {
    /**
     * @param q
     * @param location
     * @param minPrice
     * @param maxPrice
     * @param onlyAvailable
     * @returns IslandResponse OK
     * @throws ApiError
     */
    public static list1(
        q?: string,
        location?: string,
        minPrice?: number,
        maxPrice?: number,
        onlyAvailable: boolean = true,
    ): CancelablePromise<Array<IslandResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/islands',
            query: {
                'q': q,
                'location': location,
                'minPrice': minPrice,
                'maxPrice': maxPrice,
                'onlyAvailable': onlyAvailable,
            },
        });
    }
    /**
     * @param id
     * @returns IslandResponse OK
     * @throws ApiError
     */
    public static details1(
        id: string,
    ): CancelablePromise<IslandResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/islands/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param from
     * @param to
     * @returns AvailabilityResponse OK
     * @throws ApiError
     */
    public static availability(
        id: string,
        from: string,
        to: string,
    ): CancelablePromise<AvailabilityResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/islands/{id}/availability',
            path: {
                'id': id,
            },
            query: {
                'from': from,
                'to': to,
            },
        });
    }
}
