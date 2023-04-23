import React, { useState, useEffect, useRef } from 'react';
import { Table, Row, Col, Input, Button, DatePicker, Select, Space } from 'antd';
import { paginationConfig, showInfo } from '@tool/';
import moment from 'moment';
import { isObject } from 'lodash';
import { qualityManageApi } from '@api/dataAccessApi';
import { showConfirm } from '@components/confirm';

const { Search } = Input;

const { getListSystem, clearSystem, deleteSystem, getSystemVerifyTimePeriods, getSystemStatistics } =
  qualityManageApi.qualityView;

const monthFormat = 'YYYY-MM';

function RecordMaintain(props) {
  const { systemId, reFreshVerifyTime, batchTime } = props;

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [timeList, setTimeList] = useState([]);
  const [verifyTime, setVerifyTime] = useState('');
  const [verifyDate, setVerifyDate] = useState('');

  const searchValue = useRef('');


  useEffect(() => {
    systemId && loadData();
  }, [systemId]);

  const loadData = (pagination = { current, pageSize }) => {
    const { current, pageSize } = pagination;
    let params = {
      pageNo: current,
      pageSize,
      filters: { systemId },
    };
    searchValue.current && (params.searchFilters = { batchTime: searchValue.current });
    getListSystem(params).then(res => {
      const { state, data } = res.data;
      if (state) {
        const { pageNo, pageSize, total, pageBeans } = data;
        setCurrent(pageNo);
        setPageSize(pageSize);
        setTotal(total);
        setDataSource(pageBeans || []);
      }
    });
  };

  const onPageChange = (pagination, filter, sorter) => {
    loadData(pagination);
  };

  const onSearch = () => {
    searchValue.current = verifyTime || verifyDate;
    loadData({ current: 1, pageSize });
  };

  const onClearRecord = () => {
    showConfirm('确定清空所有记录吗？', '清空后该系统下所有数据都将被删除', () => {
      clearSystem({ systemId }).then(res => {
        const { state, msg } = res.data;
        state && showInfo(msg);
        loadData({ current: 1, pageSize });
        reFreshVerifyTime();
      });
    });
  };

  const onDeleteRecord = time => {
    showConfirm('确定删除当前核验记录吗？', '删除后当前日期所属所有记录将被一起删除', () => {
      deleteSystem({ batchTime: time, systemId }).then(res => {
        const { state, msg } = res.data;
        state && showInfo(msg);
        if (time === batchTime) {
          reFreshVerifyTime();
        }
        loadData({ current: 1, pageSize });
      });
    });
  };

  const onDataChange = (value, mode, initFlag) => {
    setVerifyDate(mode);
    mode &&
      getSystemVerifyTimePeriods({ periods: mode, systemId }).then(res => {
        const { data, state } = res.data;
        if (state) {
          const list = data.map(item => ({
            value: item,
            label: item,
          }));
          setTimeList(list);
        }
        !initFlag && setVerifyTime('');
      });
  };

  const onTimeChange = value => {
    setVerifyTime(value);
  };

  const onReset = () => {
    setVerifyTime('');
    setVerifyDate('');
    searchValue.current = '';
    loadData({ current: 1, pageSize });
  };

  const columns = [
    {
      title: '核验时间',
      dataIndex: 'batchTime',
      width: '19%',
    },
    {
      title: '核验耗时',
      dataIndex: 'totalTimeConsuming',
      width: '9%',
    },
    {
      title: '总表数',
      dataIndex: 'dataModelCount',
      width: '9%',
    },
    {
      title: '核验表数',
      dataIndex: 'verifyTableCount',
      width: '9%',
    },
    {
      title: '核验字段数',
      dataIndex: 'verifyFieldCount',
      width: '9%',
    },
    {
      title: '核验规则数',
      dataIndex: 'verifyRuleCount',
      width: '9%',
    },
    {
      title: '核验记录数',
      dataIndex: 'verifyDataCount',
      width: '9%',
    },
    {
      title: '问题记录数',
      dataIndex: 'questionDataCount',
      width: '9%',
    },
    {
      title: '质量得分',
      dataIndex: 'score',
      width: '9%',
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: '9%',
      render: (text, record) => (
        <Button type="link" onClick={() => onDeleteRecord(record.batchTime)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 10 }}>
        <Col>
          <Button type="primary" onClick={onClearRecord}>
            清空所有核验记录
          </Button>
        </Col>
        <Col>
          <Space>
            搜索日期：
            <DatePicker
              format={monthFormat}
              value={verifyDate ? moment(verifyDate, monthFormat) : ''}
              picker="month"
              onChange={onDataChange}
              allowClear
            />
            <Select
              value={verifyTime}
              options={timeList}
              allowClear
              style={{ width: 180 }}
              onChange={onTimeChange}
            />
            <Button type="primary" onClick={onSearch}>
              搜索
            </Button>
            <Button onClick={onReset}>重置</Button>
          </Space>
        </Col>
      </Row>
      <Table
        rowKey={record => record.id}
        size="small"
        bordered
        dataSource={dataSource}
        columns={columns}
        pagination={paginationConfig(current, total, pageSize)}
        onChange={onPageChange}
      />
    </div>
  );
}

export default RecordMaintain;
