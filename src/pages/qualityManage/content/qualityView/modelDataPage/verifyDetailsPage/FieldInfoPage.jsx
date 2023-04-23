import React, { useState, useEffect, useRef } from 'react';
import { Table, Row, Col, Input } from 'antd';
import { qualityManageApi } from '@api/dataAccessApi';
import { isArray } from 'lodash';

const { Search } = Input;

const { getFieldListDetail } = qualityManageApi.qualityView;

function FieldInfoPage(props) {
  const { dataModelId, batchTime } = props;

  const [total, setTotal] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  const allDataSource = useRef([]);


  useEffect(() => {
    if (dataModelId && batchTime) {
      loadModelDetail();
    } else {
      setDataSource([]);
    }
  }, [dataModelId, batchTime]);

  const loadModelDetail = () => {
    const params = {
      batchTime,
      dataModelId,
    };
    getFieldListDetail(params).then(res => {
      const { state, data } = res.data;
      if (state && isArray(data)) {
        setDataSource(data);
        setTotal(data.length);
        allDataSource.current = data;
      } else {
        setDataSource([]);
        setTotal(0);
        allDataSource.current = [];
      }
    });
  };

  const onSearch = value => {
    const searchFilters = value ? value.trim().toLowerCase() : '';
    const list = searchFilters
      ? allDataSource.current?.filter(
          item =>
            item.fieldName.toLowerCase().includes(searchFilters) ||
            item.fieldComment.toLowerCase().includes(searchFilters)
        )
      : [...allDataSource.current];
    setTotal(list.length);
    setDataSource(list);
  };

  const columns = [
    {
      title: '元数据名称',
      dataIndex: 'fieldName',
      ellipsis: true,
      width: '14%',
    },
    {
      title: '元数据注释',
      dataIndex: 'fieldComment',
      ellipsis: true,
      width: '14%',
    },
    {
      title: '元数据类型',
      dataIndex: 'fieldType',
      width: '6%',
    },
    {
      title: '元数据长度',
      dataIndex: 'fieldLength',
      width: '6%',
    },
    {
      title: '质量规则名称',
      dataIndex: 'qualityRuleName',
      ellipsis: true,
      width: '20%',
    },
    {
      title: '核验记录数',
      dataIndex: 'verifyDataCount',
      width: '6%',
    },
    {
      title: '问题数',
      dataIndex: 'questionDataCount',
      width: '6%',
    },
    {
      title: '改进数',
      dataIndex: 'improvementNumber',
      width: '6%',
    },
    {
      title: '合格率',
      dataIndex: 'fpy',
      width: '6%',
      render: text => `${text}%`,
    },
  ];

  return (
    <div>
      <Row style={{ marginBottom: 10 }}>
        <Col>
          <Search placeholder="元数据名称/元数据注释" allowClear onSearch={onSearch} style={{ width: 250 }} />
        </Col>
      </Row>
      <Table
        rowKey={record => record.id}
        bordered
        size="small"
        columns={columns}
        dataSource={dataSource}
        pagination={{
          total,
          showSizeChanger: true,
          showTotal: total => `共 ${total} 条`,
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}

export default FieldInfoPage;
