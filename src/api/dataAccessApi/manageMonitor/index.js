import { get, post } from '@api';

//configFileServer
export const configFileServer = {
    getList: (params) => get("/rest/meta/gather/list", params, { loading: true }),
    saveList: (params) => post("/rest/meta/gather/metadata", params),
    getProgress: (params) => get("/rest/meta/gather/metadataGatherProgressBarMap", params),
    deleteList: (params) => post("/rest/meta/gather/delete", params, { loading: true }),
    test: (params) => post("/rest/meta/link/testConnect", params),
    copy: (params) => post("/rest/meta/link/copy", params),
    exportExcelList: (params) => get("/rest/meta/dataelement/exportExcelTemplate", params, {
        responseType: 'blob',
        loading: true
    }),
}

//classifyManagePageApi
export const classifyManagePageApi = {
    getList: (params) => get("/rest/common/classify/list", params),
    getIdOpt: (params) => get("/rest/core/serialnumber/new", params),
    getDataSourceIdOpt: (params) => get("/rest/core/datasource/select", params),
    addList: (params) => post("/rest/common/classify/save", params),
    deleteList: (params) => post("/rest/common/classify/delete", params, { loading: true }),
    exportList: (params) => get("", params, {
        responseType: 'blob',
        loading: true
    }),
    getListFieldLog: (params) => get("/rest/norm/dataElement/log", params)
}