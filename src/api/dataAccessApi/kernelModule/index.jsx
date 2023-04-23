import { get, post } from '@api';

// 数据查询
export const dataQuery = {
  getList: params => get('/rest/common/dynamic/listByPage', params, {loading: true}),
  dynamicQueryTableField: params => get('/rest/common/dynamic/queryTableField', params),
  dynamicExportData: params =>
    get('/rest/common/dynamic/exportExcelAllData', params, { responseType: 'blob', loading: true }),
};

// 文件服务器
export const fileServer = {
  upLoadFileUrl: '/rest/file/uploadBusiness',
  loadFilePreview: params => get('/rest/file/preview', params, { loading: true }),
  fileDownload: params => post('/rest/file/download', params, { responseType: 'blob', loading: true }),
  businessFileDelete: params => post('/rest/file/deleteBusiness', params),
  upLoadFileByClassify: '/rest/file/upload',
  getListByPage: params => get('/rest/file/list', params, { loading: true }),
  fileBatchDelete: params => post('/rest/file/delete', params, { loading: true }),
};

//oracle表空间
export const oracleTableSpace = {
  getAssignAssetsDataSource: params => get('/rest/common/config/getAssignAssetsDataSource', params),
  getAllTableSpace: params => get('/rest/oracle/tablespace/getAllTableSpace', params, { loading: true }),
  createTableSpace: params => post('/rest/oracle/tablespace/createTableSpace', params, { loading: true }),
  updateTableSpaceName: params =>
    post('/rest/oracle/tablespace/updateTableSpaceName', params, { loading: true }),
  deleteTableSpace: params => post('/rest/oracle/tablespace/deleteTableSpace', params, { loading: true }),
  getAllTableSpaceName: params =>
    get('/rest/oracle/tablespace/getAllTableSpaceName', params, { loading: true }),
};

//oracle用户管理
export const oracleUserManager = {
  getAllUser: params => get('/rest/oracle/user/getAllUser', params, { loading: true }),
  createUser: params => post('/rest/oracle/user/createUser', params, { loading: true }),
  updateUserPassword: params => post('/rest/oracle/user/updateUserPassword', params, { loading: true }),
  dropUser: params => post('/rest/oracle/user/dropUser', params, { loading: true }),
};

//动态数据模型
export const dynamicDataModel = {
  clearDataModel: params => post('/rest/common/dynamic/clear', params, { loading: true }),
  getModelConfig: params => get('/rest/common/model/config/get', params),
  saveModelConfig: params => post('/rest/common/model/config/save', params),
  saveModelData: params => post('/rest/common/dynamic/dataSave', params),
  deleteModelData: params => post('/rest/common/dynamic/dataDelete', params),
  importExcelDataUrl: '/rest/common/dynamic/ImportExcelData',
  batchUpdateModel: params => post('/rest/common/dynamic/batchUpdate', params, { loading: true }),
  exportExcelTemplate: params =>
    get('/rest/common/dynamic/exportExcelTemplate', params, { responseType: 'blob', loading: true }),
  getHistoryData: params => get('/rest/common/dynamic/historyData', params, { loading: true }),
};

export const categoryManage = {
  getList: params => get('/rest/common/classify/list', params),
  getIdOpt: params => get('/rest/core/serialnumber/new', params),
  getListByType: params => get('/rest/common/classify/allListByType', params),
  addList: params => post('/rest/common/classify/save', params),
  deleteList: params => post('/rest/common/classify/delete', params, { loading: true }),
  exportList: params =>
    get('', params, {
      responseType: 'blob',
      loading: true,
    }),
  getTreeByType: params => get('/rest/common/classify/listStructureTreeByType', params),
};

export const advancedQueryApi = {
  getparams: params => get('/rest/common/advanceQuery/params', params),
  saveQueryConfig: params =>
    post('/rest/common/advanceQuery/save', params, {
      loading: true,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  getQueryConfig: params => get('/rest/common/advanceQuery/list', params),
  deleteQueryConfig: params => post('/rest/common/advanceQuery/delete', params),
};
