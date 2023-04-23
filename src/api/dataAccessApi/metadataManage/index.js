import {get, post} from '@api';

//公共
export const publice = {
	getClassifyOpt: (params) => get("/rest/common/classify/listStructureTreeByType", params),
	getInfoClassifyOpt: (params) => get("/rest/dataassets/information/listStructureTree", params),
	
	getGatherTable: (params) => get("/rest/meta/label/getGatherTable", params),
	getGatherTableField: (params) => get("/rest/meta/label/getGatherTableField", params),
	addClassify: (params) => post("/rest/common/classify/save", params),
}

//index
export const port = {
	getMenu: (params) => get("rest/dataassets/menu/listModelMenu", params,{loading:true}),
}

//linkConfigManage
export const linkConfigManage = {
	getList: (params) => get("/rest/meta/link/list", params,{loading:true}),
	getDatabaseType: (params) => get("/rest/meta/link/getTypes", params,{loading:true}),
	saveList: (params) => post("/rest/meta/link/save", params, { loading: true }),
	deleteList: (params) => post("/rest/meta/link/delete", params, { loading: true }),
	test: (params) => post("/rest/meta/link/testConnect", params),
	copy: (params) => post("/rest/meta/link/copy", params),
	getId: (params) => get("/rest/meta/link/generateCongId", params),
	exportExcelList: (params) => get("/rest/meta/dataelement/exportExcelTemplate", params, {
		responseType: 'blob',
		loading: true
	}),
}

//metadataGather
export const metadataGather = {
	getList: (params) => get("/rest/meta/gather/list", params, {loading: true}),
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

//metadataLabel
export const metadataLabel = {
	getList: (params) => get("/rest/meta/label/tableList", params, {loading: true}),
	getListField: (params) => get("/rest/meta/label/tableFieldList", params, { loading: true }),
	saveList: (params) => post("/rest/meta/label/setTableLabel", params),
	saveFieldList: (params) => post("/rest/meta/label/setTableFieldLabel", params),
	getClassifyOpt: (params) => get("/rest/common/classify/listStructureTreeByType", params),
	setTableClassify: (params) => post("/rest/meta/label/setTableClassify", params),
	importExcelUrl: "/rest/meta/label/importExcel",
	exportExcelList: (params) => get("/rest/meta/label/exportExcel", params, {
		responseType: 'blob',
		loading: true
	}),
	delList: (params) => post("/rest/meta/label/delete", params, { loading: true }),
	getListByRecent: (params) => get("/rest/meta/record/listByRecent", params),
}

//systemModeling
export const systemModeling = {
	//信息集
	getInfo: (params) => get("/rest/meta/syncVerify/getNewestModelVerify", params),
	getDetailInfo: (params) => get("/rest/meta/syncVerify/listByPage", params),
	createTableSql: (params) => get("/rest/meta/sync/createTableSql", params),
	scanDateList: (params) => get("/rest/meta/sync/verify/scanDateList", params),
	verifyModel: (params) => post("/rest/meta/sync/verifyModel", params),
	createTable: (params) => post("/rest/meta/sync/createTable", params),
	createBatchTable: (params) => post("/rest/meta/sync/createBatchTable", params, {loading: true}),
	deleteTable: (params) => post("/rest/meta/sync/delete", params, { loading: true }),
	/* getListResult: (params) => get("/rest/meta/sync/result/list", params), */
	getListResult: (params) => get("/rest/meta/syncResult/listByPage", params),
	systemScan: (params) => post("/rest/meta/syncVerify/systemScan", params),
	systemScanProgressBar: (params) => get("/rest/meta/syncVerify/systemScanProgressBar", params),
	systemCreateTable: (params) => post("/rest/meta/sync/systemCreateTable", params),
	systemCreateTableProgressBar: (params) => get("/rest/meta/sync/systemCreateTableProgressBar", params),
	systemVerifyTableExist: (params) => post("/rest/meta/syncVerify/systemVerifyTableExist", params),
	systemVerifyTableExistProgressBar: (params) => get("/rest/meta/syncVerify/systemVerifyTableExistProgressBar", params),
	getListParentByType: (params) => get("/rest/common/classify/listParentByType", params),
	getAssetsDataSource: (params) => get("/rest/common/config/getAssetsDataSource", params),
	updateMoodelVerifyData: (params) => post("/rest/meta/syncVerify/setModelDataSourceId", params),

	//代码集
	getListCode: (params) => get("/rest/dataassets/code/config/list", params, {
		loading: true
	}),
	addListCode: (params) => post("/rest/dataassets/code/config/save", params),
	deleteListCode: (params) => post("/rest/dataassets/code/config/delete", params, { loading: true }),
	getCodeTableNameOpt: (params) => get("/rest/dataassets/information/listStructureTree", params),
	getModelField: (params) => get("/rest/dataassets/information/getModelField", params),
	codeSyncCreateTable: (params) => post("/rest/dataassets/sync/codeSyncCreateTable", params),
	verifyCodeConfigTableExist: (params) => post("/rest/norm/sync/verify/verifyCodeConfigTableExist", params),
	getDefaultConfig: (params) => get("/rest/dataassets/code/config/getDefaultConfig", params),
	codeSync: (params) => post("/rest/dataassets/sync/codeSync", params),
	codeSyncProgressBar: (params) => get("/rest/dataassets/sync/codeSyncProgressBar", params),
}
