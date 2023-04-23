import { post, get } from '@api'

export const userLogin = (params) => post("/rest/core/auth/login", params);

export const userLogout = (params) => post("/rest/core/auth/logout", params);