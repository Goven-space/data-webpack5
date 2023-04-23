import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Space, Input, Button, Table, Menu, Dropdown, Divider, Modal } from 'antd';
import Icon from '@components/icon';
import Import from '@components/import';
import { showConfirm } from '@components/confirm';
import { kernelModule } from '@api/dataAccessApi';
import { json2Excel, showError, showInfo, paginationConfig } from '@tool';
import { exportIcon, addIcon, refreshIcon, deleteIcon, importIcon } from '@/constant/icon.js';
import NewDataModel from './NewDataModel';
import EditDataModel from './EditDataModel';

const { Search } = Input;

const { getList, dynamicQueryTableField, dynamicExportData } = kernelModule.dataQuery;
const { getModelConfig, deleteModelData, importExcelDataUrl, exportExcelTemplate } =
  kernelModule.dynamicDataModel;

function TableDataMaintenance({ dataSourceId, tableName, dataModelId }) {
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([]);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [tableWidth, setTableWidth] = useState(1350);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState('new');
  const [tableFields, setTableFields] = useState([]);
  const [targetRow, setTargetRow] = useState({});
  const [targetKeyId, setTargetKeyId] = useState('');

  const sorterValue = useRef({ sort: '', order: '' });
  const searchFilters = useRef('');
  const excelKeyToName = useRef({});

  const modalList = {
    new: {
      title: '新增',
      modalWidth: 1000,
    },
    edit: {
      title: '编辑',
      modalWidth: 1000,
    },
    import: {
      title: '导入except数据',
      modalWidth: 800,
    },
    batchEdit: {
      title: '批量修改',
      modalWidth: 700,
    },
  };

  const columns = [
    ...dynamicColumns,
    {
    title: '操作',
    key: 'action',
    ellipsis: true,
    width: 150,
    fixed: 'right',
    render: (text, record) => (
      <Space split={<Divider type="vertical" />}>
        <Button type="link" size="small" onClick={() => handleEdit(record)}>
          编辑
        </Button>
        <Button type="link" size="small" onClick={() => handleDelete(record)}>
          删除
        </Button>
      </Space>
    ),
  }];

  useEffect(() => {
    loadColumns();
    loadList();
    loadKeyId();
  }, []);

  const loadColumns = () => {
    dynamicQueryTableField({ dataSourceId, tableName }).then(res => {
      const { data, state } = res.data;
      if (state) {
        data && data.length > 6 && setTableWidth(tableWidth + (data.length - 6) * 150);
        const columns = data.map(item => {
          let title = `${item.fieldName} [${item.fieldComment}]`;
          excelKeyToName.current[item.fieldName] = title;
          return {
            title,
            dataIndex: item.fieldName,
            key: item.fieldName,
            sorter: true,
            ellipsis: true,
            width: 150,
          };
        });
        setDynamicColumns(columns);
        setTableFields(data);
      }
    });
  };

  const loadList = (pagination = { current, pageSize }) => {
    const { current, pageSize } = pagination;
    const params = {
      dataSourceId,
      tableName,
      pageNo: current,
      pageSize,
      selectFields: '*',
      sqlWhere: searchFilters.current,
      ...sorterValue.current,
    };
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

  const loadKeyId = () => {
    getModelConfig({ dataModelId }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const { saveKeyIds } = data;
        setTargetKeyId(saveKeyIds);
      }
    });
  };

  const onSearch = value => {
    searchFilters.current = value.trim();
    loadList({ current: 1, pageSize });
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
    searchFilters.current = '';
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
    setSelectedRows(selectedRows);
    setSelectedRowKeys(selectedRowKeys);
  };

  const handleCreate = () => {
    setVisible(true);
    setModalType('new');
  };

  const handleEdit = record => {
    setModalType('edit');
    setTargetRow(record);
    setVisible(true);
  };

  const handleDelete = record => {
    showConfirm('', '确定删除选中数据？', () => {
      let whereIds = '';
      if (record) {
        whereIds = record[targetKeyId];
      } else {
        whereIds = selectedRows.map(item => item[targetKeyId]).join(',');
        cancelRowSelected();
      }
      deleteModelData({ whereIds, dataSourceId, dataModelName: tableName, dataModelId }).then(res => {
        const { state, msg } = res.data;
        if (state) {
          showInfo(msg);
        }
        loadList({ current: 1, pageSize });
      });
    });
  };

  const handleCancel = () => {
    setVisible(false);
    setTargetRow({});
    loadList({ current: 1, pageSize });
  };

  const handleImport = key => {
    setVisible(true);
    setModalType('import');
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
    setModalType('batchEdit');
    setVisible(true);
  };

  const cancelRowSelected = () => {
    setSelectedRows([]);
    setSelectedRowKeys([]);
  };

  return (
    <div>
      <Modal
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={modalList[modalType].modalWidth}
        destroyOnClose={modalType === 'batchEdit'}
        title={modalList[modalType].title}
      >
        {modalType === 'import' ? (
          <Import
            uploadCallBack={uploadCallBack}
            uploadProps={uploadProps}
            postData={{ dataSourceId, dataModelName: tableName, dataModelId }}
            url={importExcelDataUrl}
          />
        ) : modalType === 'batchEdit' ? (
          <EditDataModel
            dataSourceId={dataSourceId}
            dataModelId={dataModelId}
            tableFields={tableFields}
            handleCancel={handleCancel}
            keyId={targetKeyId}
            selectedRows={selectedRows}
            cancelRowSelected={cancelRowSelected}
            tableName={tableName}
          />
        ) : (
          <NewDataModel
            rowData={targetRow}
            dataSourceId={dataSourceId}
            tableName={tableName}
            dataModelId={dataModelId}
            tableFields={tableFields}
            handleCancel={handleCancel}
          />
        )}
      </Modal>
      <Row justify="space-between" style={{ marginBottom: '5px' }}>
        <Col>
          <Space>
            <Button icon={<Icon type={addIcon} />} type="primary" onClick={handleCreate}>
              新增
            </Button>
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
            <Button
              icon={<Icon type={deleteIcon} />}
              onClick={() => handleDelete()}
              disabled={!selectedRows.length}
            >
              批量删除
            </Button>
            <Button onClick={handleBatchUpdate} disabled={!selectedRows.length}>
              批量修改
            </Button>
            <Button icon={<Icon type={refreshIcon} />} onClick={handleRefresh}>
              刷新
            </Button>
          </Space>
        </Col>
        <Col>
          <Space>
            <span>按SQL条件搜索:</span>
            <Search
              placeholder="userid='admin' or userid='test"
              onSearch={onSearch}
              style={{
                width: 400,
              }}
            />
          </Space>
        </Col>
      </Row>
      <Table
        rowKey={record => record.id || record.key}
        size="small"
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: tableWidth, y: 400 }}
        pagination={paginationConfig(current, total, pageSize)}
        onChange={onPageChange}
        rowSelection={{
          selectedRowKeys,
          onChange: handleRowSelected,
        }}
      />
    </div>
  );
}

export default TableDataMaintenance;
