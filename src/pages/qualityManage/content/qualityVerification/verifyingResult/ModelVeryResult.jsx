import React, { useState, useEffect, useRef } from 'react';
import { Table, Tag, Card } from 'antd';
import { qualityManageApi, standardManage } from '@api/dataAccessApi';
import { paginationConfig } from '@tool/';
// import classNames from 'classnames';
// import ResizeObserver from 'rc-resize-observer';
// import { VariableSizeGrid as Grid } from 'react-window';

const { verifyDataModel } = qualityManageApi.qualityVerification;
const { getList } = standardManage.informationManageApi;

function ModelDataPage(props) {
  const { record = {} } = props;

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  const width = 150;

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
      title: '核验结果',
      dataIndex: 'verifyResult',
      ellipsis: true,
      width: width - 50,
    },
  ];

  return (
    <Card>
      <Table
        rowKey={record => record.id}
        bordered
        size="small"
        dataSource={record.dataModelDoList || []}
        columns={columns}
        scroll={{ x: 'max-content' }}
        pagination={false}
      />
    </Card>
  );
}

export default ModelDataPage;
