/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateQuoteRequest } from '../models/CreateQuoteRequest';
import type { QuoteResponse } from '../models/QuoteResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PublicQuotesControllerService {
    /**
     * @param requestBody
     * @returns QuoteResponse OK
     * @throws ApiError
     */
    public static create1(
        requestBody: CreateQuoteRequest,
    ): CancelablePromise<QuoteResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/public/quotes',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
