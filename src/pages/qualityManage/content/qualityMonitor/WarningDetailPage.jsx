import React, { useState, useEffect, useRef } from 'react';
import { Table, Row, Col, Input, Tag, Select, Space } from 'antd';
import { qualityManageApi } from '@api/dataAccessApi';
import { paginationConfig } from '@tool/';

const { Search } = Input;

const { getTodayWarningRecord } = qualityManageApi.qualityMonitor;

function WarningDetailPage(props) {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [type, setType] = useState('');

  const searchValue = useRef();

  useEffect(() => {
    loadData({ current: 1, pageSize });
  },[type]) 

  const loadData = (pagination = { current, pageSize }) => {
    const { current, pageSize } = pagination;
    let params = {
      pageNo: current,
      pageSize,
    };
    type && (params.filters = {type})
    const value = searchValue.current;
    value &&
      (params.searchFilters = {
        currentErrorRatio: value,
        sendApiUrl: value,
        sendResponseBody: value,
      });
    getTodayWarningRecord(params).then(res => {
      const { state } = res.data;
      if (state) {
        const { pageNo, pageSize, rows, total } = res.data;
        setCurrent(pageNo);
        setPageSize(pageSize);
        setDataSource(rows);
        setTotal(total);
      }
    });
  };

  const onPageChange = (pagination, filter, sorter) => {
    loadData(pagination);
  };

  const onSearch = value => {
    searchValue.current = value ? value.trim() : '';
    loadData({ current: 1, pageSize });
  };

  const onTypeChange = value => {
    value = value || ''
    setType(value)
  }

  const columns = [
    {
      title: '消息告警类型',
      dataIndex: 'type',
      width: 100,
      render: text => (text === '1' ? <Tag color="purple">数据模型</Tag> : <Tag color="blue">字段</Tag>),
    },
    {
      title: '系统名称',
      dataIndex: 'systemName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '数据模型名称',
      dataIndex: 'dataModelName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '数据模型字段名称',
      dataIndex: 'dataModelFieldName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '设置告警异常率',
      dataIndex: 'warningErrorRatio',
      width: 100,
      ellipsis: true,
      render: text => `${text}%`,
    },
    {
      title: '当前异常率',
      dataIndex: 'currentErrorRatio',
      width: 80,
      ellipsis: true,
      render: text => `${text}%`,
    },
    {
      title: '告警时间',
      dataIndex: 'createTime',
      width: 100,
      ellipsis: true,
    },
    {
      title: '发送告警API',
      dataIndex: 'sendApiUrl',
      width: 130,
      ellipsis: true,
    },
    {
      title: '发送告警响应结果',
      dataIndex: 'sendResponseBody',
      width: 150,
      ellipsis: true,
    },
  ];

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 10 }}>
        <Col>
          <Space>
            <Search
              placeholder="当前异常率/发送告警API/发送告警响应结果"
              allowClear
              onSearch={onSearch}
              style={{ width: 310 }}
            />
            消息告警类型:
            <Select
              allowClear
              options={[
                { value: '1', label: '数据模型' },
                { value: '2', label: '字段' },
              ]}
              style={{ width: 100 }}
              onChange={onTypeChange}
            />
          </Space>
        </Col>
      </Row>
      <Table
        bordered
        size="middle"
        columns={columns}
        dataSource={dataSource}
        pagination={paginationConfig(current, total, pageSize)}
        onChange={onPageChange}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}

export default WarningDetailPage;
