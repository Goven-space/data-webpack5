import React, { useEffect, useState, useRef } from 'react';
import { Table, Switch, Row, Col, Space, Input, Button, Tag, Select, Popover, Modal, Card } from 'antd';
import Icon from '@components/icon';
import { refreshIcon } from '@/constant/icon.js';
import { showInfo } from '@tool';
import { paginationConfig } from '@tool';
import { standardManage } from '@api/dataAccessApi';
import ResultDetailPage from './ResultDetailPage';
import FieldUpdateViewPage from './FieldUpdateViewPage';
import FieldLogPage from './FieldLogPage';
import { showConfirm } from '@components/confirm';

const { getListResult, getListTableNameByPage, getListFieldByPage, batchDataSyncTableField } =
  standardManage.systemModelingApi;
const Search = Input.Search;

const syncFieldType = {
  added: {
    title: '新增字段',
    color: 'green',
  },
  update: {
    title: '修改字段',
    color: 'blue',
  },
  delete: {
    title: '删除字段',
    color: 'red',
  },
};

export default function ResultPage(props) {
  const { classifyId, dataModelId, scanTime, contentFlag = 'result' } = props;
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [syncType, setSyncType] = useState(false); //是否已同步选项

  const syncField = useRef(false);
  const primaryBuilding = useRef(false);
  const searchFilters = useRef({});

  // let searchData = {};
  const width = 150;

  const resultColumns = [
    {
      title: '编号',
      dataIndex: 'num',
      width: width - 50,
      ellipsis: true,
    },
    {
      title: '名称',
      dataIndex: 'modelName',
      width: width - 30,
      ellipsis: true,
    },
    {
      title: '表名',
      dataIndex: 'tableName',
      width,
      ellipsis: true,
    },
    {
      title: '耗时',
      dataIndex: 'elapsedTime',
      width: width - 50,
      ellipsis: true,
    },
    {
      title: '同步字段数',
      dataIndex: 'syncFieldCount',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '同步失败字段数',
      dataIndex: 'syncErrorCount',
      ellipsis: true,
      width,
    },
    {
      title: '同步成功字段数',
      dataIndex: 'syncSuccessCount',
      ellipsis: true,
      width,
    },
    {
      title: '是否构建主键',
      dataIndex: 'buildPrimaryKey',
      ellipsis: true,
      width: width - 10,
      render: text => {
        return text ? <Tag color="green">是</Tag> : <Tag color="orange">否</Tag>;
      },
    },
    {
      title: '主键构建结果',
      dataIndex: 'primaryKey',
      ellipsis: true,
      width,
      render: text => <Tag color={text ? 'success' : 'error'}>{text ? '成功' : '失败'}</Tag>,
    },
    {
      title: '建模时间',
      dataIndex: 'scanTime',
      width: width + 50,
    },
  ];

  const updateResultColumns = [
    {
      title: '执行时间',
      dataIndex: 'createTime',
      ellipsis: true,
      width: '15%',
    },
    {
      title: '名称',
      dataIndex: 'modelName',
      ellipsis: true,
      width: '15%',
    },
    {
      title: '原表名',
      dataIndex: 'oldTableName',
      ellipsis: true,
      width: '15%',
    },
    {
      title: '新表名',
      dataIndex: 'newTableName',
      ellipsis: true,
      width: '15%',
    },
    {
      title: '是否修改成功',
      dataIndex: 'success',
      ellipsis: true,
      width: '10%',
      render: text => <Tag color={text ? 'success' : 'error'}>{text ? '成功' : '失败'}</Tag>,
    },
    {
      title: '异常消息',
      dataIndex: 'errorMsg',
      ellipsis: true,
      width: '30%',
    },
  ];

  const fieldSyncColumns = [
    {
      title: '字段同步类型',
      dataIndex: 'syncFieldType',
      ellipsis: true,
      width: width - 50,
      render: (text, record) =>
        text === 'update' ? (
          <Popover
            content={
              <Button type="link" onClick={() => showFieldUpdate(record)}>
                查看
              </Button>
            }
            trigger="hover"
          >
            <Tag color={syncFieldType[text].color}>{syncFieldType[text].title}</Tag>
          </Popover>
        ) : (
          <Tag color={syncFieldType[text].color}>{syncFieldType[text].title}</Tag>
        ),
    },
    {
      title: '元数据字段名称',
      dataIndex: 'fieldName',
      ellipsis: true,
      width,
    },
    {
      title: '元数据字段注释',
      dataIndex: 'fieldComment',
      ellipsis: true,
      width,
    },
    {
      title: '元数据字段类型',
      dataIndex: 'fieldType',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '元数据字段长度',
      dataIndex: 'fieldLength',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '是否为空',
      dataIndex: 'fieldNull',
      ellipsis: true,
      width: width - 90,
      render: text => {
        return <Tag color={text ? 'cyan' : 'orange'}>{text ? '是' : '否'}</Tag>;
      },
    },
    {
      title: '是否已进行同步操作',
      dataIndex: 'syncOperation',
      ellipsis: true,
      width: width - 50,
      render: text => {
        return <Tag color={text ? 'cyan' : 'orange'}>{text ? '是' : '否'}</Tag>;
      },
    },
    {
      title: '同步时间',
      dataIndex: 'editTime',
      ellipsis: true,
      width: width - 40,
    },
    {
      title: '异常消息',
      dataIndex: 'errorMsg',
      ellipsis: true,
      width: width + 50,
    },
  ];

  const typeList = {
    result: {
      columns: resultColumns,
      apiGet: getListResult,
      searchTip: '编号/名称/表名',
    },
    updateResult: {
      columns: updateResultColumns,
      apiGet: getListTableNameByPage,
      searchTip: '编号/名称/表名',
    },
    syncFieldResult: {
      columns: fieldSyncColumns,
      apiGet: getListFieldByPage,
      searchTip: '元数据字段名称/注释',
    },
  };

  const syncOptions = [
    {
      value: false,
      label: '否',
    },
    {
      value: true,
      label: '是',
    },
  ];

  useEffect(() => {
    getTableData({pageNo: 1, pageSize: 10});
  }, [syncType]);

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }, value = true) => {
    const option = contentFlag === 'result' ? { sort: 'scanTime', order: 'DESC' } : {};
    const filters = contentFlag === 'updateResult' ? { dataModelId } : { classifyId, dataModelId };
    contentFlag === 'syncFieldResult' && (filters.syncOperation = syncType);
    // syncField.current && (option.error = 'error');
    primaryBuilding.current && (filters.primaryKey = false);
    const apiGet = typeList[contentFlag].apiGet;
    apiGet({
      ...pagination,
      ...option,
      filters,
      searchFilters: { ...searchFilters.current },
    }).then(res => {
      const { state, rows, pageNo, pageSize, total } = res.data;
      if (state) {
        setDataSource(rows);
        setPageNo(pageNo);
        setPageSize(pageSize);
        setTotal(total);
      }
      setSelectedRowKeys([]);
      setSelectedRows([]);
    });
  };

  const onPageChange = (page, size) => {
    getTableData({ pageNo: page, pageSize: size });
  };

  const onSearch = value => {
    value = value.trim();
    searchFilters.current = value ? { num: value, modelName: value, tableName: value } : {};
    getTableData({ pageNo: 1, pageSize });
  };

  const refresh = () => {
    searchFilters.current = {};
    getTableData();
  };

  const handleSyncField = checked => {
    syncField.current = checked;
    getTableData({ pageNo: 1, pageSize });
  };

  const handlePrimaryBuilding = checked => {
    primaryBuilding.current = checked;
    getTableData({ pageNo: 1, pageSize });
  };

  const showFieldUpdate = record => {
    setCurrentRowData(record);
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
  };

  const handleSyncTypeChange = value => {
    setSyncType(value)
  };

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
  };

  const handleSync = () => {
    showConfirm('', '注意：只会更新主数据待同步记录，不会同步更新至数据库表结构信息', () => {
      let fieldIds = selectedRows.map(item => item.fieldId).join(',');
      let verifyDataId = selectedRowKeys.join(',');
      batchDataSyncTableField({ fieldIds, dataModelId, verifyDataId }).then(res => {
        const { state, msg } = res.data;
        if (state) showInfo(msg);
        refresh();
      });
    });
  };

  return (
    <div>
      <Modal
        visible={visible}
        footer={null}
        onCancel={closeModal}
        width={1500}
        destroyOnClose
        title="查看字段修改结果"
      >
        <FieldUpdateViewPage rowData={currentRowData} />
      </Modal>
      <div style={{ marginBottom: 10 }}>
        <Row justify="space-between">
          <Col>
            <Space>
              {contentFlag === 'syncFieldResult' && (
                <Button type="primary" disabled={!selectedRowKeys.length || syncType} onClick={handleSync}>
                  逻辑字段数据同步
                </Button>
              )}
              {contentFlag === 'result' && (
                <>
                  {'同步字段失败>0'}
                  <Switch onChange={handleSyncField} />
                  主键构建失败
                  <Switch onChange={handlePrimaryBuilding} />
                </>
              )}
              <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              {contentFlag === 'syncFieldResult' && (
                <>
                  是否已同步:
                  <Select options={syncOptions} defaultValue={false} onChange={handleSyncTypeChange} />
                </>
              )}
              <Search
                placeholder={typeList[contentFlag].searchTip}
                allowClear
                onSearch={onSearch}
                style={{ width: 250 }}
              />
            </Space>
          </Col>
        </Row>
      </div>
      <div>
        <Table
          size="small"
          columns={typeList[contentFlag].columns}
          dataSource={dataSource}
          expandable={{
            expandedRowRender: (record, index, indent, expanded) => {
              return contentFlag === 'syncFieldResult' ? (
                <Card title="字段更变记录">
                  <FieldLogPage id={record.fieldId} />
                </Card>
              ) : (
                <ResultDetailPage record={record}></ResultDetailPage>
              );
            },
          }}
          rowSelection={
            contentFlag === 'syncFieldResult'
              ? {
                  selectedRowKeys,
                  onChange: onSelectChange,
                }
              : undefined
          }
          rowKey={row => row.id}
          scroll={{ x: 1100 }}
          pagination={paginationConfig(pageNo, total, pageSize, onPageChange)}
        />
      </div>
    </div>
  );
}
