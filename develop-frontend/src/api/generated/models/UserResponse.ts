/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserResponse = {
    id: string;
    email: string;
    name: string;
    role: UserResponse.role;
    favoritesIslandIds: Array<string>;
    favoritesJetIds: Array<string>;
    createdAt: string;
};
export namespace UserResponse {
    export enum role {
        ADMIN = 'ADMIN',
        USER = 'USER',
    }
}

