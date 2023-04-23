import { get, post } from "@api";

export const getUserInfo = (params) => get("/rest/base/userinfo", params);

export const updateUserInfo = (params) => post("/rest/base/userinfo/update", params);

export const getLeftMenu = (params) => get("/rest/base/menu/tree", params);

export const getInterfaceConfig = (params) => get("/core/system/html/config/get", params);

export const getSysInfo = (params) => get("/rest/base/system/info", params);

export const getPermissionInfo = (params) => get("/rest/base/platformConfig/system/permissions", params);