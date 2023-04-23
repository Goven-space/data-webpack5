import React, { useEffect, useState, useRef } from 'react';
import { Table, Row, Col, Input, Button, Space, Tag, Select } from 'antd';
import { kernelModule } from '@api/dataAccessApi';
import { paginationConfig, showInfo } from '@tool';

const { getHistoryData } = kernelModule.dynamicDataModel;
const { Search } = Input;
const { TextArea } = Input;

const type = {
  insert: { name: '新增', color: 'green' },
  update: { name: '编辑', color: 'cyan' },
  batchUpdate: { name: '批量编辑', color: 'blue' },
  delete: { name: '删除', color: 'geekblue' },
  batchDelete: { name: '批量删除', color: 'purple' },
};

const options = [
  { label: '新增', value: 'insert' },
  { label: '编辑', value: 'update' },
  { label: '批量编辑', value: 'batchUpdate' },
  { label: '删除', value: 'delete' },
  { label: '批量删除', value: 'batchDelete' },
];

export default function OperatingRecordPage(props) {
  const { dataModelId, saveKeyIds, saveKeyIdValue } = props;
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);

  const searchFilters = useRef({})
  const filters = useRef({ dataModelId, saveKeyIds, saveKeyIdValue });

  const columns = [
    {
      title: '操作类型',
      dataIndex: 'dataModelOperateType',
      width: '10%',
      render: text => <Tag color={type[text].color}>{type[text].name}</Tag>,
    },
    {
      title: '关键字段',
      dataIndex: 'saveKeyIds',
      width: '30%',
    },
    {
      title: '关键字段值',
      dataIndex: 'saveKeyIdValue',
      width: '20%',
    },
    {
      title: '操作人',
      dataIndex: 'editorName',
      width: '15%',
    },
    {
      title: '操作时间',
      dataIndex: 'editTime',
      width: '25%',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = (pagination = { current, pageSize }) => {
    const { current, pageSize } = pagination;
    const params = {
      current,
      pageSize,
      // dataModelId,
      // saveKeyIds,
      // saveKeyIdValue,
      filters: filters.current,
      searchFilters: searchFilters.current,
    };
    getHistoryData(params).then(res => {
      const { state } = res.data;
      if (state) {
        const { pageNo, pageSize, rows, total } = res.data;
        setDataSource(rows);
        setCurrent(pageNo);
        setPageSize(pageSize);
        setTotal(total);
      }
    });
  };

  const onSearch = value => {
    value = value ? value.trim() : ''
    searchFilters.current = value ? { saveKeyIds: value, editorName: value, editTime: value } : {};
    loadData({current: 1, pageSize})
  };

  const onRefresh = () => {
    loadData({current: 1, pageSize})
  }

  const onPageChange = (pagination, filters, sorter) => {
    loadData(pagination);
  };

  const onTypeChange = value => {
    filters.current = value ? { dataModelId, saveKeyIds, saveKeyIdValue, dataModelOperateType: value } : { dataModelId, saveKeyIds, saveKeyIdValue };
    loadData({current: 1, pageSize});
  }

  const expandedRowRender = (record, index, indent) => {
    let text;
    try {
      text = JSON.stringify(JSON.parse(record.data), null, 4);
    } catch (error) {
      text = '';
    }
    return <TextArea value={text} autoSize readOnly />;
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 10 }}>
        <Col>
          <Button onClick={onRefresh} type="primary">
            刷新
          </Button>
        </Col>
        <Col>
          <Space>
            操作类型：
            <Select options={options} style={{ width: 100 }} allowClear onChange={onTypeChange} />
            搜索：
            <Search placeholder="关键字段/操作人/操作时间" allowClear onSearch={onSearch} style={{ width: 300 }} />
          </Space>
        </Col>
      </Row>
      <Table
        size="small"
        columns={columns}
        dataSource={dataSource}
        rowKey={row => row.id}
        expandable={{
          expandedRowRender,
        }}
        pagination={paginationConfig(current, total, pageSize)}
        onChange={onPageChange}
      />
    </div>
  );
}
