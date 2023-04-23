import React, { useState, useEffect, useRef, useContext } from 'react';
import { Row, Col, Space, Input, Button, Table, Menu, Dropdown, Modal, Form, Drawer, InputNumber, DatePicker } from 'antd';
import Icon from '@components/icon';
import Import from '@components/import';
import TextToolTip from '@components/textToolTip';
import { isArray } from 'lodash';
import { showConfirm } from '@components/confirm';
import { kernelModule, masterDataManage } from '@api/dataAccessApi';
import { json2Excel, showInfo, paginationConfig } from '@tool';
import { exportIcon, addIcon, refreshIcon, deleteIcon, importIcon, dropupIcon, dropdownIcon, resetIcon, searchIcon, configIcon } from '@/constant/icon.js';
import MainContext from '@store';
import NewDataModel from './NewDataModel';
import EditDataModel from './EditDataModel';
import AdvancedQueryPage from './AdvancedQueryPage';
import OperatingRecordPage from './OperatingRecordPage';
import './index.less';

const { TimePicker } = DatePicker;

const { getList, dynamicExportData } = kernelModule.dataQuery;
const { deleteModelData, importExcelDataUrl, exportExcelTemplate } = kernelModule.dynamicDataModel;
const { getFormConfigField, getPrimaryKey } = masterDataManage.modelManage;

const dateFormat = 'YYYY-MM-DD';
const monthFormat = 'YYYY-MM';
const yearFormat = 'YYYY';
const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
const timeFormat = 'HH:mm:ss';

function TableDataMaintenance(props) {
  const { readOnly = false } = props;
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([]);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState('new');
  const [formQuery, setFormQuery] = useState([]);
  const [formAdvancedQuery, setFormAdvancedQuery] = useState([]);
  const [targetRow, setTargetRow] = useState({});
  const [targetKeyId, setTargetKeyId] = useState('');
  const [expand, setExpand] = useState(true);
  const [queryLength, setQueryLength] = useState(0);
  const [formAddItems, setFormAddItems] = useState([]);
  const [formEditItems, setFormEditItems] = useState([]);
  const [saveKeyIdValue, setSaveKeyIdValue] = useState('');

  const sorterValue = useRef({ sort: '', order: '' });
  const searchFilters = useRef({});
  const excelKeyToName = useRef({});
  const allFormQuery = useRef([]);
  const queryTimeFormats = useRef({});

  const [form] = Form.useForm();

  const { targetMenuItem } = useContext(MainContext);
  const { datamodelid: dataModelId = '', datasourceid: dataSourceId = '', tablename: tableName = '' } = targetMenuItem;

  const formLayout4_20 = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };
  const queryItemSpan = queryLength > 2 ? 8 : 24 / queryLength;
  const queryFormSpan = queryLength > 2 ? 18 : queryLength * 6;

  const dialogList = {
    new: {
      title: '新增',
      modalWidth: 1200,
    },
    edit: {
      title: '编辑',
      modalWidth: 1200,
    },
    import: {
      title: '导入except数据',
      modalWidth: 800,
    },
    batchEdit: {
      title: '批量修改',
      modalWidth: 700,
    },
    query: {
      title: '高级搜索',
      modalWidth: 1200,
    },
    record: {
      title: '操作记录',
      modelWidth: 1500,
    },
  };

  const itemsType = {
    calender: {
      content: <DatePicker picker="date" format={dateFormat} />,
      format: dateFormat,
    },
    calender_month: {
      content: <DatePicker picker="month" format={monthFormat} />,
      format: monthFormat,
    },
    calender_year: {
      content: <DatePicker picker="year" format={yearFormat} />,
      format: yearFormat,
    },
    datetime: {
      content: <DatePicker picker="date" showTime={true} format={dateTimeFormat} />,
      format: dateTimeFormat,
    },
    time: {
      content: <TimePicker format={timeFormat} />,
      format: timeFormat,
    },
    float: {
      content: <InputNumber controls={false} />,
    },
    int: {
      content: <InputNumber formatter={value => (value ? Number(value)?.toFixed(0) : value)} />,
    },
    string: {
      content: <Input />,
    },
  };

  const columns = [
    ...dynamicColumns,
    {
      title: '操作',
      key: 'action',
      ellipsis: true,
      width: 80,
      fixed: 'right',
      render: (text, record) => {
        return (
          <Dropdown
            trigger={['click']}
            placement="bottom"
            overlay={
              <Menu>
                <Menu.Item key="edit">
                  <Button type="link" size="small" onClick={() => handleEdit(record)}>
                    编辑
                  </Button>
                </Menu.Item>
                <Menu.Item key="delete">
                  <Button type="link" size="small" onClick={() => handleDelete(record)}>
                    删除
                  </Button>
                </Menu.Item>
                <Menu.Item key="record">
                  <Button type="link" size="small" onClick={() => showRecord(record)}>
                    操作记录
                  </Button>
                </Menu.Item>
              </Menu>
            }
          >
            <a onClick={e => e.preventDefault()}>
              <Space>
                操作
                <Icon type={dropdownIcon} />
              </Space>
            </a>
          </Dropdown>
        );
      },
    },
  ];

  useEffect(() => {
    const { datamodelid = '', datasourceid = '', tablename = '' } = targetMenuItem;
    if (datamodelid) {
      loadKeyId();
      loadColumns();
    } else {
      clearConfig();
    }
    if (datasourceid && tablename) {
      loadList();
    } else {
      clearTableData();
    }
  }, [targetMenuItem]);

  const loadKeyId = () => {
    getPrimaryKey({ dataModelId }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const { saveKeyIds } = data;
        setTargetKeyId(saveKeyIds || '');
      }
    });
  };

  const loadColumns = () => {
    getFormConfigField({ dataModelId }).then(res => {
      const { data, state } = res.data;
      if (state && isArray(data)) {
        const columns = data
          .filter(i => i.formShow)
          .map(item => {
            let title = `${item.fieldName} [${item.fieldComment}]`;
            excelKeyToName.current[item.fieldName] = title;
            return {
              title,
              dataIndex: item.fieldName,
              key: item.fieldName,
              sorter: true,
              ellipsis: true,
            };
          });
        setDynamicColumns(columns);
        setFormAdvancedQuery(data.filter(i => i.formAdvancedQuery));
        setFormAddItems(data.filter(i => i.formAdd));
        setFormEditItems(data.filter(i => i.formEdit));
        allFormQuery.current = data.filter(i => i.formQuery);
        allFormQuery.current.forEach(item => {
          ['calender', 'calender_month', 'calender_year', 'datetime', 'time'].includes(item.editFieldFormat) && (queryTimeFormats.current[item.fieldName] = itemsType[item.editFieldFormat].format);
        });
        showFormItem(expand);
        const length = allFormQuery.current.length;
        setQueryLength(length);
      }
    });
  };

  const loadList = (pagination = { current, pageSize }, advancedQuery) => {
    const { current, pageSize } = pagination;
    const params = {
      dataSourceId,
      tableName,
      pageNo: current,
      pageSize,
      selectFields: '*',
      ...sorterValue.current,
      advancedQuery,
    };
    Object.keys(searchFilters.current).length && (params.queryFields = searchFilters.current);
    getList(params).then(res => {
      const { state, rows, total, pageNo, pageSize } = res.data;
      if (state) {
        setDataSource(rows);
        setCurrent(pageNo);
        setPageSize(pageSize);
        setTotal(total);
      }
    });
  };

  const clearConfig = () => {
    setDynamicColumns([]);
    setFormAddItems([]);
    setFormEditItems([]);
    setFormAdvancedQuery([]);
    allFormQuery.current = [];
    showFormItem(expand);
  };
  const clearTableData = () => {
    setDataSource([]);
    setTotal(0);
    setCurrent(1);
    setPageSize(10);
    setTargetKeyId('');
  };

  const onPageChange = ({ current, pageSize }, filter, sorter) => {
    sorterValue.current = sorter.order
      ? {
          sort: sorter.field,
          order: sorter.order === 'ascend' ? 'ASC' : 'DESC',
        }
      : { sort: '', order: '' };
    loadList({ current, pageSize });
  };

  const handleRefresh = () => {
    setSelectedRows([]);
    setSelectedRowKeys([]);
    loadList({ current: 1, pageSize });
  };

  const handleExport = ({ key }) => {
    let title, callback;
    if (key === 'exportAllExcel') {
      title = '确定导出全量数据？';
      callback = () => dynamicExportData({ dataSourceId, tableName });
    } else if (key === 'exportExcel') {
      title = '确定导出选中数据？';
      callback = () => json2Excel(selectedRows, 'sheet1', tableName + '.xlsx', excelKeyToName.current);
    } else if (key === 'exportExcelTemplate') {
      title = '确定导出excel模板？';
      callback = () => exportExcelTemplate({ dataSourceId, tableName });
    }
    showConfirm('', title, callback);
  };

  const handleRowSelected = (selectedRowKeys, selectedRows) => {
    if (!targetKeyId) {
      showInfo('请先配置关键字段');
    } else {
      setSelectedRows(selectedRows);
      setSelectedRowKeys(selectedRowKeys);
    }
  };

  const handleCreate = () => {
    if (!targetKeyId) {
      showInfo('请先配置关键字段');
    } else {
      setOpen(true);
      setDialogType('new');
    }
  };

  const handleEdit = record => {
    if (!targetKeyId) {
      showInfo('请先配置关键字段');
    } else {
      setDialogType('edit');
      setTargetRow(record);
      setOpen(true);
    }
  };

  const handleDelete = record => {
    if (!targetKeyId) {
      showInfo('请先配置关键字段');
    } else {
      showConfirm('', '确定删除选中数据？', () => {
        let whereIds = '';
        if (record) {
          whereIds = record[targetKeyId];
        } else {
          whereIds = selectedRows.map(item => item[targetKeyId]).join(',');
          cancelRowSelected();
        }
        deleteModelData({
          whereIds,
          dataSourceId,
          dataModelName: tableName,
          dataModelId,
          dataModelOperateType: record ? 'delete' : 'batchDelete',
        }).then(res => {
          const { state, msg } = res.data;
          if (state) {
            showInfo(msg);
          }
          loadList({ current: 1, pageSize });
        });
      });
    }
  };

  const handleCancel = flag => {
    setVisible(false);
    setTargetRow({});
    if (flag) {
      loadList({ current: 1, pageSize });
    }
  };

  const handleImport = key => {
    setVisible(true);
    setDialogType('import');
  };

  const uploadCallBack = () => {
    setVisible(false);
    loadList({ current: 1, pageSize });
  };

  const uploadProps = {
    accept: '.xlsx',
    maxCount: 1,
    multiple: false,
  };

  const handleBatchUpdate = () => {
    setDialogType('batchEdit');
    setVisible(true);
  };

  const cancelRowSelected = () => {
    setSelectedRows([]);
    setSelectedRowKeys([]);
  };

  const showFormItem = expand => {
    const formitem = expand ? allFormQuery.current.slice(0, 6) : allFormQuery.current;
    setFormQuery(formitem);
  };

  const handleExpand = () => {
    if (queryLength < 4) return;
    const flag = !expand;
    setExpand(flag);
    showFormItem(flag);
  };

  const handleSearch = values => {
    let data = { ...values };
    for (let key in data) {
      data[key] && queryTimeFormats.current?.[key] && (data[key] = data[key].format(queryTimeFormats.current?.[key]));
    }
    searchFilters.current = { ...data };
    setSelectedRows([]);
    setSelectedRowKeys([]);
    loadList({ current: 1, pageSize });
  };

  const handleReset = () => {
    form.resetFields();
    searchFilters.current = {};
    setSelectedRows([]);
    setSelectedRowKeys([]);
    loadList({ current: 1, pageSize });
  };

  const showAdvancedQuery = () => {
    setVisible(true);
    setDialogType('query');
  };

  const handleDrawerClose = flag => {
    setOpen(false);
    setTargetRow({});
    if (flag === true) {
      loadList({ current: 1, pageSize });
    }
  };

  const showRecord = record => {
    if (!targetKeyId) {
      showInfo('请先配置关键字段');
    } else {
      setSaveKeyIdValue(record[targetKeyId] || '');
      setDialogType('record');
      setOpen(true);
    }
  };

  const searchItems = formQuery.map(item => {
    return (
      <Col span={queryItemSpan} key={item.fieldName}>
        <Form.Item name={item.fieldName} label={<TextToolTip text={item.fieldComment} />} {...formLayout4_20}>
          {itemsType[item.editFieldFormat].content}
        </Form.Item>
      </Col>
    );
  });

  const modelList = {
    import: (
      <Import
        uploadCallBack={uploadCallBack}
        uploadProps={uploadProps}
        postData={{
          dataSourceId,
          dataModelName: tableName,
          dataModelId,
        }}
        url={importExcelDataUrl}
      />
    ),
    batchEdit: (
      <EditDataModel dataSourceId={dataSourceId} dataModelId={dataModelId} tableFields={formEditItems} handleCancel={handleCancel} keyId={targetKeyId} selectedRows={selectedRows} cancelRowSelected={cancelRowSelected} tableName={tableName} />
    ),
    query: <AdvancedQueryPage formAdvancedQuery={formAdvancedQuery} dataModelId={dataModelId} loadList={loadList} closeModal={handleCancel} />,
  };

  const saveContent = <NewDataModel dialogType={dialogType} rowData={targetRow} dataSourceId={dataSourceId} tableName={tableName} dataModelId={dataModelId} formAddItems={formAddItems} formEditItems={formEditItems} handleCancel={handleDrawerClose} />;

  const drawerList = {
    record: <OperatingRecordPage dataModelId={dataModelId} saveKeyIds={targetKeyId} saveKeyIdValue={saveKeyIdValue} />,
    new: saveContent,
    edit: saveContent,
  };

  return (
    <div className="assets-view-content">
      <Modal key={Math.random()} visible={visible} footer={null} onCancel={handleCancel} width={dialogList[dialogType].modalWidth} destroyOnClose={dialogType === 'batchEdit'} title={dialogList[dialogType].title}>
        {modelList[dialogType] || null}
      </Modal>
      <Drawer visible={open} title={dialogList[dialogType].title} width={1200} destroyOnClose onClose={handleDrawerClose}>
        {drawerList[dialogType] || null}
      </Drawer>
      <div className="view-table-top">
        <Form form={form} onFinish={handleSearch}>
          <Row gutter={24} justify="start" className="search-form-content">
            {!!formQuery?.length && (
              <Col span={queryFormSpan}>
                <Row justify="start">{searchItems}</Row>
              </Col>
            )}
            <Col span={6}>
              <Form.Item>
                <Space>
                  <Button disabled={!formQuery?.length} onClick={handleReset} icon={<Icon type={resetIcon} />}>
                    重置
                  </Button>
                  <Button disabled={!formQuery?.length} type="primary" htmlType="submit" icon={<Icon type={searchIcon} />}>
                    搜索
                  </Button>
                  <Button type="primary" icon={<Icon type={configIcon} />} onClick={showAdvancedQuery} disabled={!formAdvancedQuery.length}>
                    高级
                  </Button>
                  {allFormQuery.current.length > 6 && (
                    <a
                      style={{
                        fontSize: 12,
                      }}
                      onClick={handleExpand}
                    >
                      {expand ? '展开' : '收起'}
                      <Icon type={expand ? dropdownIcon : dropupIcon} />
                    </a>
                  )}
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Row justify="space-between" style={{ marginBottom: 10 }}>
          <Col>
            <Space>
              {!readOnly && (
                <Button icon={<Icon type={addIcon} />} type="primary" onClick={handleCreate}>
                  新增
                </Button>
              )}
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu
                    onClick={handleExport}
                    items={[
                      {
                        label: '导出Excel模板',
                        key: 'exportExcelTemplate',
                      },
                      { label: '导出Excel', key: 'exportExcel', disabled: !selectedRowKeys.length },
                      { label: '导出全量Excel', key: 'exportAllExcel' },
                    ]}
                  />
                }
                placement="bottomLeft"
              >
                <Button icon={<Icon type={exportIcon} />}>导出</Button>
              </Dropdown>
              {!readOnly && (
                <>
                  <Dropdown
                    trigger={['click']}
                    overlay={
                      <Menu
                        onClick={handleImport}
                        items={[
                          {
                            label: '导入Excel数据',
                            key: 'importExcel',
                          },
                        ]}
                      />
                    }
                    placement="bottomLeft"
                  >
                    <Button icon={<Icon type={importIcon} />}>导入</Button>
                  </Dropdown>
                  <Button icon={<Icon type={deleteIcon} />} onClick={() => handleDelete()} disabled={!selectedRows.length}>
                    批量删除
                  </Button>
                  <Button onClick={handleBatchUpdate} disabled={!selectedRows.length}>
                    批量修改
                  </Button>
                </>
              )}
              <Button icon={<Icon type={refreshIcon} />} onClick={handleRefresh}>
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      <div className="content-table-content">
        <Table
          rowKey={record => record[targetKeyId] || record.id || record.key}
          columns={readOnly ? dynamicColumns : columns}
          dataSource={dynamicColumns.length ? dataSource : []}
          scroll={{ x: 'max-content' }}
          pagination={paginationConfig(current, total, pageSize)}
          onChange={onPageChange}
          rowSelection={{
            selectedRowKeys,
            onChange: handleRowSelected,
          }}
        />
      </div>
    </div>
  );
}

export default TableDataMaintenance;
