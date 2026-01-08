/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Island } from '../models/Island';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminIslandControllerService {
    /**
     * @param id
     * @param requestBody
     * @returns Island OK
     * @throws ApiError
     */
    public static updateIsland(
        id: string,
        requestBody: Island,
    ): CancelablePromise<Island> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/admin/islands/{id}',
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
    public static deleteIsland(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/admin/islands/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Island OK
     * @throws ApiError
     */
    public static getAllIslands(): CancelablePromise<Array<Island>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/islands',
        });
    }
    /**
     * @param requestBody
     * @returns Island OK
     * @throws ApiError
     */
    public static createIsland(
        requestBody: Island,
    ): CancelablePromise<Island> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/islands',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
