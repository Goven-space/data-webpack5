import { get, post } from '@api';

//公共
export const publice = {
  getClassifyOpt: params => get('/rest/common/classify/listStructureTreeByType', params, { loading: true }),
  getInfoClassifyOpt: params => get('/rest/norm/information/listStructureTree', params, { loading: true }),
  getInfoClassifySelect: params => get('/rest/norm/information/listClassStructureTree',params, {loading: true}),
  getFieldTypeDataElementOpt: params => get('/rest/common/config/getFieldType', params),
  getAppList: params => get('/rest/core/apps', params),
  getDataSourceLink: params => get('/rest/core/datasource/select', params),
};

//index
export const port = {
  getMenu: params => get('rest/dataassets/menu/listModelMenu', params, { loading: true }),
};

//metaDataManage
export const metaDataManageApi = {
  getList: params => get('/rest/norm/dataElement/list', params),
  // getFieldTypeOpt: (params) => get("/rest/common/config/getFieldType?type=postgresql", params),
  getCodeTypeOpt: params => get('/rest/common/classify/listStructureTreeByType', params),
  getCodeOpt: params => get('/rest/norm/code/getByClassifyId', params),
  addList: params => post('/rest/norm/dataElement/insert', params),
  editList: params => post('/rest/norm/dataElement/update', params),
  deleteList: params => post('/rest/norm/dataElement/delete', params, { loading: true }),
  exportExcelList: params =>
    get('/rest/norm/dataElement/exportExcelTemplate', params, { responseType: 'blob', loading: true }),
  exportStandardList: params =>
    get('/rest/norm/dataElement/exportNationalStandardExcelTemplate', params, {
      responseType: 'blob',
      loading: true,
    }),
  importExcelList: '/rest/norm/dataElement/importExcel',
  importBsonList: '/rest/norm/dataElement/importBson',
  importStandard: '/rest/norm/dataElement/importNationalStandardExcel',
  exportBsonList: params =>
    get('/rest/norm/dataElement/exportBson', params, { responseType: 'blob', loading: true }),
  getListFieldLog: params => get('/rest/norm/dataElement/log/list', params),
  listStructureTree: params => get('/rest/norm/code/listStructureTree', params),
  getRelationalGraph: params => get('/rest/norm/dataElement/getRelationalGraph', params),
  batchSyncMetaData: params => post('/rest/norm/dataElement/batchSyncMetaData', params, { loading: true }),
};

//codeSetManage
export const codeSetManageApi = {
  getList: params => get('/rest/norm/code/list', params, { loading: true }),
  addList: params => post('/rest/norm/code/insert', params),
  editList: params => post('/rest/norm/code/update', params),
  deleteList: params => post('/rest/norm/code/delete', params, { loading: true }),
  exportList: params =>
    get('/rest/norm/code/exportExcelTemplate', params, { responseType: 'blob', loading: true }),
  getListFieldData: params => get('/rest/norm/codeItem/list', params),
  addListFieldData: params => post('/rest/norm/codeItem/insert', params),
  editListFieldData: params => post('/rest/norm/codeItem/update', params),
  deleteListFieldData: params => post('/rest/norm/codeItem/delete', params, { loading: true }),
  initCode: params => post('/rest/norm/code/initCode', params),
  importExcelUrl: '/rest/norm/code/importExcel',
  importStandard: '/rest/norm/code/importNationalStandardExcelData',
  exportExcelList: params =>
    get('/rest/norm/code/exportExcelTemplate', params, {
      responseType: 'blob',
      loading: true,
    }),
  exportStandardList: params =>
    get('/rest/norm/code/exportNationalStandardExcelTemplate', params, {
      responseType: 'blob',
      loading: true,
    }),
  listStructureTree: params => get('/rest/common/classify/dynamicListStructureTreeData', params),
  upLoadFileUrl: '/rest/file/uploadBusiness',
  loadFilePreview: params => get('/rest/file/preview', params),
  fileDownload: params => post('/rest/file/download', params, { responseType: 'blob', loading: true }),
};

//informationManage
export const informationManageApi = {
  getList: params => get('/rest/norm/information/list', params, { loading: true }),
  addList: params => post('/rest/norm/information/insert', params, { loading: true }),
  addClassifyList: params => post('/rest/norm/information/insert', params, { loading: true }),
  editList: params => post('/rest/norm/information/update', params),
  deleteList: params => post('/rest/norm/information/delete', params, { loading: true }),
  exportList: params =>
    get('/rest/norm/code/exportExcelTemplate', params, { responseType: 'blob', loading: true }),

  getTypeOpt: params => get('/rest/common/classify/listStructureTreeByType', params), //共用接口
  getFieldOpt: params => get('/rest/norm/dataElement/getByClassifyIds', params),
  saveConfig: params => post('/rest/norm/dataElement/configureDataModel', params),
  showField: params => get('/rest/norm/dataElement/getDataModelField', params),
  checkField: params => post('/rest/norm/information/verifyModelFieldExists', params),
  addCustom: params => post('/rest/norm/dataElement/customAdd', params),
  getListField: params => get('/rest/norm/information/getModelField', params, { loading: true }),

  getDetailData: params => get('/rest/norm/information/getDetailField', params),
  saveDetailData: params => post('/rest/norm/information/saveDetailField', params),
  listPrimaryKey: params => get('/rest/norm/information/getPrimaryKeyModelField', params),
  listClassStructureTree: params => get('/rest/norm/information/listClassStructureTree', params),
  listByClassify: params => get('/rest/norm/information/listByClassify', params),

  getFormField: params => get('/rest/norm/information/getFormField', params),
  saveDetailField: params =>
    post('/rest/norm/information/saveListDetailField', params, {
      loading: true,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  getListByRecent: params => get('/rest/norm/model/listByRecent', params),
  getListByTopClassify: params => get('/rest/norm/information/listByTopClassify', params),
  getFormFieldType: params => get('/rest/common/model/config/formFieldType', params),
  getFormFieldFormat: params => get('/rest/common/model/config/formFieldFormat', params),
  syncModelLowCode: params => post('/rest/norm/information/syncModelLowCode', params),
  getAppsSelect: params => get('/rest/etl/apps/select', params),
  getListFlow: params => get('/rest/norm/integration/listFlow', params),
};

//systemModeling
export const systemModelingApi = {
  //信息集
  getInfo: params => get('/rest/norm/sync/verify/getNewestModelVerify', params),
  getDetailInfo: params => get('/rest/norm/sync/verify/listByPage', params),
  createTableSql: params => get('/rest/norm/sync/createTableSql', params),
  scanDateList: params => get('/rest/norm/sync/verify/scanDateList', params),
  verifyModel: params => post('/rest/dataassets/sync/verifyModel', params),
  createTable: params => post('/rest/dataassets/sync/createTable', params),
  /* getListResult: (params) => get("/rest/dataassets/sync/result/list", params), */
  deleteTable: params => post('/rest/norm/sync/delete', params, { loading: true }),
  createBatchTable: params => post('/rest/norm/sync/createBatchTable', params, { loading: true }),
  getListResult: params => get('/rest/norm/sync/result/listByPage', params),
  systemScan: params => post('/rest/norm/sync/verify/systemScan', params),
  systemScanProgressBar: params => get('/rest/norm/sync/verify/systemScanProgressBar', params),
  systemCreateTable: params => post('/rest/norm/sync/systemCreateTable', params),
  systemCreateTableProgressBar: params => get('/rest/norm/sync/systemCreateTableProgressBar', params),
  systemVerifyTableExist: params => post('/rest/norm/sync/verify/systemVerifyTableExist', params),
  systemVerifyTableExistProgressBar: params =>
    get('/rest/norm/sync/verify/systemVerifyTableExistProgressBar', params),
  getCodeTableNameOpt: params => get('/rest/norm/information/listStructureTree', params),
  getRootClassify: params => get('/rest/norm/information/getRootClassify', params, {loading: true}),
  getAssetsDataSource: params => get('/rest/common/config/getAssetsDataSource', params),
  updateMoodelVerifyData: params => post('/rest/norm/sync/verify/setModelDataSourceId', params),
  getModelKeysField: params => get('/rest/norm/information/getModelKeysField', params),

  //代码集
  getListCode: params => get('/rest/norm/code/config/list', params, { loading: true }),
  addListCode: params => post('/rest/norm/code/config/save', params),
  deleteListCode: params => post('/rest/norm/code/config/delete', params, { loading: true }),

  getModelField: params => get('/rest/norm/information/getModelField', params),
  codeSyncCreateTable: params => post('/rest/dataassets/sync/codeSyncCreateTable', params),
  verifyCodeConfigTableExist: params => post('/rest/norm/sync/verify/verifyCodeConfigTableExist', params),
  getDefaultConfig: params => get('/rest/norm/code/config/getDefaultConfig', params),
  codeSync: params => post('/rest/dataassets/sync/codeSync', params),
  codeSyncProgressBar: params => get('/rest/dataassets/sync/codeSyncProgressBar', params),
  batchSyncTableField: params => post('/rest/norm/sync/batchSyncTableField', params),
  allSyncTableField: params => post('/rest/norm/sync/allSyncTableField', params),
  systemTableFieldProgressBar: params => get('/rest/norm/sync/systemTableFieldProgressBar', params),
  updateTableName: params => post('/rest/norm/sync/updateTableName', params),
  batchUpdateTableName: params => post('/rest/norm/sync/batchUpdateTableName', params),
  getListTableNameByPage: params => get('/rest/norm/sync/result/listTableNameByPage', params),
  getListFieldByPage: params => get('/rest/norm/sync/result/listFieldByPage', params),
  batchDataSyncTableField: params => post('/rest/norm/sync/batchDataSyncTableField', params, {loading: true}),

  //回收站
  getRecycleList: params => get('/rest/norm/information/recycle/list', params),
  recoverAllDataModel: params => post('/rest/norm/information/recycle/recoverAllDataModel', params),
  recoverDataModel: params => post('/rest/norm/information/recycle/recoverDataModel', params),
  clearDataModel: params => post('/rest/norm/information/recycle/clearDataModel', params),
  deleteDataModel: params => post('/rest/norm/information/recycle/deleteDataModel', params),
};

//classifyManagePageApi
export const classifyManagePageApi = {
  getList: params => get('/rest/common/classify/list', params),
  getIdOpt: params => get('/rest/core/serialnumber/new', params),
  getDataSourceIdOpt: params => get('/rest/core/datasource/select', params),
  addList: params => post('/rest/common/classify/save', params),
  deleteList: params => post('/rest/common/classify/delete', params, { loading: true }),
  exportList: params =>
    get('', params, {
      responseType: 'blob',
      loading: true,
    }),
  getListFieldLog: params => get('/rest/norm/dataElement/log', params),
};

