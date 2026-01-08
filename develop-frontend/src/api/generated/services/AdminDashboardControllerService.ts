/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DashboardStats } from '../models/DashboardStats';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminDashboardControllerService {
    /**
     * @returns DashboardStats OK
     * @throws ApiError
     */
    public static getDashboardStats(): CancelablePromise<DashboardStats> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/stats',
        });
    }
}
