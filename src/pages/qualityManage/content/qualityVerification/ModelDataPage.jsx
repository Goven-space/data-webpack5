import React, { useState, useEffect, useRef } from 'react';
import { Table, Tag, Card } from 'antd';
import { standardManage } from '@api/dataAccessApi';
import {paginationConfig} from '@tool/'
// import classNames from 'classnames';
// import ResizeObserver from 'rc-resize-observer';
// import { VariableSizeGrid as Grid } from 'react-window';

const { getList } = standardManage.informationManageApi;

function ModelDataPage(props) {
  const { record = {}, expanded } = props;

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [dataSource, setDataSource] = useState([]);

   const width = 150;

  useEffect(() => {
    expanded && loadData();
  }, [expanded]);

  const loadData = (pagination = { current, pageSize }) => {
    const { current, pageSize } = pagination;
    const params = {
      pageNo: current,
      pageSize,
      filters: { theirTopClassifyId: record.key, type: 'dataModel' },
      sort: 'sort',
      order: 'asc'
    };
    getList(params).then(res => {
      const { state } = res.data;
      if (state) {
        const {total, pageNo, pageSize, rows} = res.data
        setCurrent(pageNo)
        setDataSource(rows)
        setPageSize(pageSize)
        setTotal(total)
      }
    });
  };

  const onPageChange = (pagination, filters, sorter) => {
    loadData(pagination);
  }

  const columns = [
    {
      title: '编号',
      dataIndex: 'num',
      width,
      ellipsis: true,
    },
    {
      title: '表名',
      dataIndex: 'tableName',
      ellipsis: true,
      width,
    },
    {
      title: '名称',
      dataIndex: 'modelName',
      ellipsis: true,
      width,
    },
    {
      title: '字段数量',
      dataIndex: 'childNodeCount',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '是否已建模',
      dataIndex: 'buildModel',
      ellipsis: true,
      width: width - 70,
      render: text => (text ? <Tag color="green">是</Tag> : <Tag color="orange">否</Tag>),
    },
    {
      title: '是否需要核验',
      dataIndex: 'verify',
      ellipsis: true,
      width: width - 70,
      render: text => (text ? <Tag color="green">是</Tag> : <Tag color="orange">否</Tag>),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      ellipsis: true,
      width: width - 70,
    },
  ];

  return (
    <Card>
      <Table
        rowKey={record => record.id}
        bordered
        size="small"
        dataSource={dataSource}
        columns={columns}
        scroll={{ x: 'max-content' }}
        pagination={paginationConfig(current, total, pageSize, undefined, [10, 20, 30, 100, 500])}
        onChange={onPageChange}
      />
    </Card>
  );
}

export default ModelDataPage;
