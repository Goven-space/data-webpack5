import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Table, Typography } from 'antd';

const { Title } = Typography;

function FieldUpdateViewPage(props) {
  const { rowData = {} } = props;
  const [originValue, setOriginValue] = useState([]);
  const [targetValue, setTargetValue] = useState([]);

  useEffect(() => {
    if (Object.keys(rowData).length) {
      setSourceData(rowData);
    }
  }, [rowData]);

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '值',
      dataIndex: 'value',
      width: 150,
    },
  ];

  const baseDataSource = [
    { key: 'fieldName', name: '字段名称', value: '' },
    { key: 'fieldComment', name: '字段注释', value: '' },
    { key: 'fieldType', name: '字段类型', value: '' },
    { key: 'fieldLength', name: '字段长度', value: '' },
    { key: 'fieldRadixPoint', name: '字段小数点', value: '' },
    { key: 'defaultValue', name: '字段默认值', value: '' },
  ];

  const setSourceData = (rowData = {}) => {
    const { originalValue } = rowData;
    setOriginValue(getFields({ ...rowData }));
    try {
      const values = JSON.parse(originalValue || '{}');
      setTargetValue(getFields({ ...values }));
    } catch {}
  };

  const getFields = (values = {}) => {
    const list = baseDataSource.map(i => {
      const item = { ...i };
      item.value = values[item.key] || '';
      return item;
    });
    return list;
  };

  return (
    <Row justify="center">
      <Col span={6}>
        <Title level={5}>原字段</Title>
        <Table
          size="small"
          rowKey={record => record.fieldId}
          dataSource={originValue}
          columns={columns}
          pagination={false}
          bordered
        />
      </Col>
      <Col span={4}>
        <svg width="100%" height="100%">
          <defs>
            <marker
              id="triangle"
              markerUnits="strokeWidth"
              markerWidth="5"
              markerHeight="4"
              refX="0"
              refY="2"
              orient="auto"
            >
              <path stroke="#3a78f2" fill="#3a78f2" d="M 0 0 L 5 2 L 0 4 z" />
            </marker>
          </defs>
          {targetValue.map((item, index) =>
            item.value !== originValue[index].value ? (
              <path
                d={`M 0,${80 + 37 * index} L 230,${80 + 37 * index}`}
                stroke="#3a78f2"
                stroke-width="2"
                fill="#3a78f2"
                style={{ markerEnd: 'url(#triangle)' }}
              />
            ) : null
          )}
        </svg>
      </Col>
      <Col span={6}>
        <Title level={5}>修改后字段</Title>
        <Table
          size="small"
          rowKey={record => record.fieldId}
          dataSource={targetValue}
          columns={columns}
          pagination={false}
          bordered
        />
      </Col>
    </Row>
  );
}

export default FieldUpdateViewPage;
