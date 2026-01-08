/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponse } from '../models/AuthResponse';
import type { LoginRequest } from '../models/LoginRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthControllerService {
    /**
     * @param requestBody
     * @returns AuthResponse OK
     * @throws ApiError
     */
    public static register(
        requestBody: RegisterRequest,
    ): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/public/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns AuthResponse OK
     * @throws ApiError
     */
    public static login(
        requestBody: LoginRequest,
    ): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/public/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static login1(
        requestBody: LoginRequest,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
