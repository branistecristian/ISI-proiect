/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Jet } from '../models/Jet';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminJetControllerService {
    /**
     * @param id
     * @param requestBody
     * @returns Jet OK
     * @throws ApiError
     */
    public static updateJet(
        id: string,
        requestBody: Jet,
    ): CancelablePromise<Jet> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/admin/jets/{id}',
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
    public static deleteJet(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/admin/jets/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Jet OK
     * @throws ApiError
     */
    public static getAllJets(): CancelablePromise<Array<Jet>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/jets',
        });
    }
    /**
     * @param requestBody
     * @returns Jet OK
     * @throws ApiError
     */
    public static createJet(
        requestBody: Jet,
    ): CancelablePromise<Jet> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/jets',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
