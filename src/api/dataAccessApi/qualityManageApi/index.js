import { get, post } from '@api';

// 质量规则
export const qualityRule = {
  getList: params => get('/rest/quality/rule/list', params),
  deleteRule: params => post('/rest/quality/rule/delete', params),
  saveRule: params => post('/rest/etl/rules/save', params, { loading: true }),
  exportUrl: '/rest/etl/rules/export',
  getRuleCode: params => get('/rest/core/coderepository/template/getcode', params),
  getById: params => get('/rest/core/coderepository/history/detail/id', params),
  compileCheck: params => post('/rest/core/coderepository/compile/check', params),
  readCodeClasspath: params => get('/rest/core/coderepository/srcfile/readcode/classpath', params),
  overCode: params => post('/rest/core/coderepository/srcfile/overcode/classpath', params),
  checkout: params => get('/rest/core/coderepository/checkout', params),
  commitCode: params => post('/rest/core/coderepository/commit', params),
  getBranchname: params => get('/rest/core/coderepository/current/branchname', params),
  getHistoryList: params => get('/rest/core/coderepository/history/list/page', params),
  getDetailById: params => get('/rest/core/coderepository/history/detail/id', params),
  getReferenceRuleField: params => get('/rest/quality/rule/referenceRuleField', params),
  getReferenceRuleModel: params => get('/rest/quality/rule/referenceRuleModel', params),

  getNewSerialNumber: params => get('/rest/core/serialnumber/new', params), //获取一个新的流水号
};

// 质量规则配置
export const ruleConfig = {
  saveRuleConfig: params =>
    post('/rest/quality/ruleConfig/save', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  detectionField: params => get('/rest/quality/ruleConfig/detectionField', params),
  getQualityRuleList: params => get('/rest/quality/rule/all', params),
  getWarningConfig: params => get('/rest/quality/ruleConfig/warning', params),
};

// 质量核验
export const qualityVerification = {
  getHomeData: params => get('/rest/quality/verify/home', params),
  systemVerify: params => post('/rest/quality/verify/system', params),
  getSystemProgressBar: params => get('/rest/quality/verify/systemProgressBar', params),
  verifyDataModel: params => post('/rest/quality/verify/dataModel', params),
};

// 质量查看
export const qualityView = {
  getSystemVerifyTimePeriods: params => get('/rest/quality/verifyView/systemVerifyTimePeriods', params),
  getSystemStatistics: params => get('/rest/quality/verifyView/systemStatistics', params, { loading: true }),
  getLastSystemVerifyTime: params =>
    get('/rest/quality/verifyView/lastSystemVerifyTime', params, { loading: true }),
  getListModelDetail: params => get('/rest/quality/verifyView/listModelDetail', params, { loading: true }),
  getListSystem: params => get('/rest/quality/verifyView/listSystem', params),
  clearSystem: params => post('/rest/quality/verifyView/clearSystem', params),
  deleteSystem: params => post('/rest/quality/verifyView/deleteSystem', params),
  getModelVerifyTimePeriods: params => get('/rest/quality/verifyView/modelVerifyTimePeriods', params),
  getModelStatistics: params => get('/rest/quality/verifyView/modelStatistics', params),
  getFieldListDetail: params => get('rest/quality/verifyView/fieldListDetail', params),
  getListModelField: params => get('/rest/quality/question/record/listModelField', params),
  getListModelRecord: params => get('/rest/quality/question/record/listModelRecord', params),
  getListModelRule: params => get('/rest/quality/question/record/listModelRule', params),
  clearQuestionRecord: params => post('/rest/quality/question/record/clear', params),
  deleteQuestionRecord: params => post('/rest/quality/question/record/delete', params),
  clearDataModel: params => post('/rest/quality/verifyView/clearDataModel', params),
  deleteDataModel: params => post('/rest/quality/verifyView/deleteDataModel', params),
  getListDataModel: params => get('/rest/quality/verifyView/listDataModel', params),
  getModelFpyAnalyse: params => get('/rest/quality/analyse/modelFpy', params, { loading: true }),
  getSystemModelFpy: params => get('/rest/quality/analyse/systemModelFpy', params),
  getModelRuleListDetail: params => get('/rest/quality/verifyView/modelRuleListDetail', params, {loading: true}),
};

export const qualityMonitor = {
  getHomeTopStat: params => get('/rest/quality/monitor/homeTopStat', params),
  getTodayWarningRecord: params => get('/rest/quality/monitor/todayVerifyWarningRecord', params),
  getDataCenterInfo: params => get('/rest/quality/monitor/dataCenter', params),
  getDataModelChange: params => get('/rest/quality/monitor/dataModelChange', params),
  getTrendAnalyse: params => get('/rest/quality/monitor/trendAnalyse', params),
};