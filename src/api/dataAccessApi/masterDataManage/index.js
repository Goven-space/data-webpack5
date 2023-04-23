import { get, post } from '@api';

// 主数据维护
export const masterDataMaintenance = {
    getColumns: (params) => get("/rest/master/setList/get", params),
}

export const modelManage = {
  getList: params => get('/rest/dataasset/master/model/list', params),
  deleteList: params => post('/rest/dataasset/master/model/delete', params),
  getField: params => get('/rest/dataasset/master/model/getField', params),
  getAllByClassify: params => get('/rest/dataasset/master/model/all', params),
  listStructureTree: params => get('/rest/common/classify/dynamicListStructureTreeData', params),
  getDataSourceList: params => get('/rest/core/datasource/select', params),
  getTableList: params => post('/rest/core/modelconfigs/listAllTables', params),
  getColumnsByTableName: params => post('/rest/core/modelconfigs/columns/getColumnsByTableName', params),
  saveModelConfig: params => post('/rest/dataasset/master/model/save', params),
  getModelConfig: params => get(`/rest/core/modelconfigs/${params.id}`),
  getDataSourceSelect: params => get('/rest/core/datasource/select', params),
  getIdOpt: params => get('/rest/core/serialnumber/new', params),
  getModelField: params => get('/rest/norm/information/getModelField', params),
  getInfoClassifyOpt: params => get('/rest/norm/information/listStructureTree', params, { loading: true }),
  getInfo: params => get('/rest/wisdom/sync/verify/getNewestModelVerify', params),
  getFormConfigField: params => get('/rest/norm/information/getFormConfigField', params, { loading: true }),
  saveField: params =>
    post('/rest/dataasset/master/model/saveField', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  loadField: params => get('/rest/dataasset/master/model/loadField', params),
  getModelDataSourceId: params => get('/rest/norm/sync/verify/getModelDataSourceId', params),
  getPrimaryKey: params => get('/rest/common/model/config/get', params),
  //从元数据批量同步
  batchSyncModel: params => post('/rest/dataasset/master/model/batchSyncModel', params, { loading: true }),
  getPersonJsonByDeptId: params => get('/rest/base/org/dept/getPersonJsonByDeptId', params),
};