/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type User = {
    id?: string;
    email: string;
    passwordHash: string;
    name: string;
    role: User.role;
    favoritesIslandIds: Array<string>;
    favoritesJetIds: Array<string>;
    createdAt: string;
};
export namespace User {
    export enum role {
        ADMIN = 'ADMIN',
        USER = 'USER',
    }
}

