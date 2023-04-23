import React, { useState, useEffect, useRef } from 'react';
import { Table, Row, Col, Input, Button, DatePicker, Select, Space, Popconfirm } from 'antd';
import { paginationConfig, showInfo } from '@tool/';
import { isObject, isArray } from 'lodash';
import { qualityManageApi } from '@api/dataAccessApi';
import { showConfirm } from '@components/confirm';

const { getListModelField, getListModelRecord, getListModelRule, clearQuestionRecord, deleteQuestionRecord } =
  qualityManageApi.qualityView;

function RecordMaintain(props) {
  const { dataModelId, batchTime } = props;

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [targetField, setTargetField] = useState('');
  const [targetRule, setTargetRule] = useState('');
  const [ruleOptions, setRuleOptions] = useState([]);

  const searchValue = useRef('');

  useEffect(() => {
    if (dataModelId) {
      loadColumns();
      batchTime && loadData();
      loadRuleOptions();
    }
  }, [dataModelId]);
  
  useEffect(() => {
    if (dataModelId && batchTime) { 
      loadData();
    }
  }, [batchTime]);

  useEffect(() => {
    loadData({ current: 1, pageSize });
  }, [targetField, targetRule]);

  const loadColumns = () => {
    getListModelField({ dataModelId }).then(res => {
      const { state, data } = res.data;
      if (state && isArray(data)) {
        let options = [];
        const list = data.map(item => {
          options.push({
            value: item.id,
            label: `${item.fieldName} - ${item.fieldComment}`,
          });
          return {
            title: `${item.fieldName} [${item.fieldComment}]`,
            dataIndex: item.fieldName,
            ellipsis: true,
            width: 150,
          };
        });
        setFieldOptions(options);
        setColumns(list);
      } else {
        setFieldOptions([]);
        setColumns([]);
      }
    });
  };

  const loadData = (pagination = { current, pageSize }) => {
    const { current, pageSize } = pagination;
    let params = {
      pageNo: current,
      pageSize,
      filters: { mdmQualityVerifyDataModelId: dataModelId, mdmQualityVerifyBatchTime: batchTime },
      defaultFilters: {},
    };
    targetField && (params.defaultFilters.mdmQualityVerifyFieldIds = targetField);
    targetRule && (params.defaultFilters.mdmQualityVerifyRuleIds = targetRule);
    searchValue.current && (params.searchFilters = { batchTime: searchValue.current });
    getListModelRecord(params).then(res => {
      const { state, data } = res.data;
      if (state) {
        const { pageNo, pageSize, total, pageDocs } = data;
        setCurrent(pageNo);
        setPageSize(pageSize);
        setTotal(total);
        setDataSource(pageDocs || []);
      }
    });
  };

  const loadRuleOptions = () => {
    getListModelRule({ dataModelId }).then(res => {
      const { state, data } = res.data;
      if (state && isArray(data)) {
        const list = data.map(item => ({
          label: item.name,
          value: item.value,
        }));
        setRuleOptions(list);
      }
    });
  };

  const onPageChange = (pagination, filter, sorter) => {
    loadData(pagination);
  };

  const onFieldChange = value => {
    setTargetField(value || '');
  };

  const onRuleChange = value => {
    setTargetRule(value || '');
  };

  const onClear = () => {
    clearQuestionRecord({ dataModelId }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
      }
      loadData({current: 1, pageSize})
    });
  };

  const onDelete = () => {
    deleteQuestionRecord({ dataModelId, batchTime }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
      }
       loadData({ current: 1, pageSize });
    });
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 10 }}>
        <Col>
          <Space>
            <Popconfirm title="确认清空所有记录数据？" onConfirm={onClear}>
              <Button type="primary">清空所有记录数据</Button>
            </Popconfirm>
            <Popconfirm title="确认删除本期记录数据？" onConfirm={onDelete}>
              <Button>删除本期记录数据</Button>
            </Popconfirm>
          </Space>
        </Col>
        <Col>
          <Space>
            命中字段：
            <Select
              options={fieldOptions}
              style={{ width: 200 }}
              allowClear
              value={targetField}
              onChange={onFieldChange}
            />
            命中规则：
            <Select
              options={ruleOptions}
              style={{ width: 200 }}
              allowClear
              value={targetRule}
              onChange={onRuleChange}
            />
          </Space>
        </Col>
      </Row>
      <Table
        bordered
        rowKey={record => record.id}
        size="small"
        dataSource={dataSource}
        columns={columns}
        pagination={paginationConfig(current, total, pageSize)}
        scroll={{x: 'max-content'}}
        onChange={onPageChange}
      />
    </div>
  );
}

export default RecordMaintain;
