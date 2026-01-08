/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JetResponse } from '../models/JetResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PublicJetsControllerService {
    /**
     * @param q
     * @param minPricePerHour
     * @param maxPricePerHour
     * @param minRangeKm
     * @param maxRangeKm
     * @returns JetResponse OK
     * @throws ApiError
     */
    public static list(
        q?: string,
        minPricePerHour?: number,
        maxPricePerHour?: number,
        minRangeKm?: number,
        maxRangeKm?: number,
    ): CancelablePromise<Array<JetResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/jets',
            query: {
                'q': q,
                'minPricePerHour': minPricePerHour,
                'maxPricePerHour': maxPricePerHour,
                'minRangeKm': minRangeKm,
                'maxRangeKm': maxRangeKm,
            },
        });
    }
    /**
     * @param id
     * @returns JetResponse OK
     * @throws ApiError
     */
    public static details(
        id: string,
    ): CancelablePromise<JetResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/jets/{id}',
            path: {
                'id': id,
            },
        });
    }
}
