/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateProfileRequest } from '../models/UpdateProfileRequest';
import type { UserResponse } from '../models/UserResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserControllerService {
    /**
     * @returns UserResponse OK
     * @throws ApiError
     */
    public static me(): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/me',
        });
    }
    /**
     * @param requestBody
     * @returns UserResponse OK
     * @throws ApiError
     */
    public static update(
        requestBody: UpdateProfileRequest,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/user/me',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param jetId
     * @returns UserResponse OK
     * @throws ApiError
     */
    public static addFavJet(
        jetId: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/favorites/jets/{jetId}',
            path: {
                'jetId': jetId,
            },
        });
    }
    /**
     * @param jetId
     * @returns UserResponse OK
     * @throws ApiError
     */
    public static removeFavJet(
        jetId: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/user/favorites/jets/{jetId}',
            path: {
                'jetId': jetId,
            },
        });
    }
    /**
     * @param islandId
     * @returns UserResponse OK
     * @throws ApiError
     */
    public static addFavIsland(
        islandId: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/favorites/islands/{islandId}',
            path: {
                'islandId': islandId,
            },
        });
    }
    /**
     * @param islandId
     * @returns UserResponse OK
     * @throws ApiError
     */
    public static removeFavIsland(
        islandId: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/user/favorites/islands/{islandId}',
            path: {
                'islandId': islandId,
            },
        });
    }
}
