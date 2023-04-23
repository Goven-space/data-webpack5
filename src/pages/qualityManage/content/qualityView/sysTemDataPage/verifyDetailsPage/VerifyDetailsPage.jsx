import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, Tabs, Table, Row, Col, Input } from 'antd';
import { qualityManageApi } from '@api/dataAccessApi';
import { paginationConfig } from '@tool/';
import { isArray } from 'lodash';
import RecordMaintain from './RecordMaintain';
import DataModelQualifyBar from './DataModelQualifyBar';

const Text = Typography.Text;
const TabPane = Tabs.TabPane;
const { Search } = Input;

const { getListModelDetail } = qualityManageApi.qualityView;

function VerifyDetailsPage(props) {
  const { systemId, batchTime, reFreshVerifyTime, showView } = props;

  const [total, setTotal] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  const allDataSource = useRef([])

  useEffect(() => {
    if (systemId && batchTime) {
      loadModelDetail();
    } else {
      setDataSource([]);
    }
  }, [systemId, batchTime]);

  const loadModelDetail = () => {
    const params = {
      batchTime,
      systemId,
    };
    getListModelDetail(params).then(res => {
      const { state, data } = res.data;
      if (state && isArray(data)) {
        setDataSource(data);
        setTotal(data.length)
        allDataSource.current = data
      } else {
        setDataSource([])
        setTotal(0)
        allDataSource.current = []
      }
    });
  };

  const onSearch = value => {
    const searchFilters = value ? value.trim().toLowerCase() : '';
    const list = searchFilters
      ? allDataSource.current?.filter(
          item =>
            item.tableName.toLowerCase().includes(searchFilters) ||
            item.dataModelName.toLowerCase().includes(searchFilters)
        )
      : [...allDataSource.current];
    setTotal(list.length);
    setDataSource(list);
  };

  const ruleColumns = [
    {
      title: '数据模型表名',
      dataIndex: 'tableName',
      width: '14%',
    },
    {
      title: '数据模型名称',
      dataIndex: 'dataModelName',
      width: '14%',
    },
    {
      title: '总字段数',
      dataIndex: 'fieldCount',
      width: '7%',
    },
    {
      title: '核验字段数',
      dataIndex: 'verifyFieldCount',
      width: '7%',
    },
    {
      title: '核验规则数',
      dataIndex: 'verifyRuleCount',
      width: '8%',
    },
    {
      title: '总数据量',
      dataIndex: 'verifyDataCount',
      width: '8%',
    },
    {
      title: '核验正常记录数',
      dataIndex: 'normalDataCount',
      width: '9%',
    },
    {
      title: '核验问题记录数',
      dataIndex: 'questionDataCount',
      width: '9%',
    },
    {
      title: '改进记录数',
      dataIndex: 'improvementNumber',
      width: '8%',
    },
    {
      title: '核验耗时',
      dataIndex: 'totalTimeConsuming',
      width: '8%',
    },
    {
      title: '合格率',
      dataIndex: 'fpy',
      width: '8%',
      render: text => `${text}%`,
    },
  ];

  return (
    <Card style={{ marginTop: 20, borderRadius: 10 }} bodyStyle={{ padding: '10px 20px' }}>
      <Text style={{ fontSize: 16 }}>核验详情</Text>
      <Tabs size="large" defaultActiveKey="rule" destroyInactiveTabPane>
        <TabPane tab="自定义规则" key="rule">
          <Row style={{ marginBottom: 10 }}>
            <Col>
              <Search placeholder="模型表名/模型名称" allowClear onSearch={onSearch} style={{ width: 250 }} />
            </Col>
          </Row>
          <Table
            rowKey={record => record.id}
            size="small"
            bordered
            columns={ruleColumns}
            dataSource={dataSource}
            pagination={{
              total,
              showSizeChanger: true,
              showTotal: total => `共 ${total} 条`,
            }}
            scroll={{ x: 'max-content' }}
          />
        </TabPane>
        <TabPane tab="数据模型合格率" key="pass">
          <DataModelQualifyBar systemId={systemId} batchTime={batchTime} showView={showView} />
        </TabPane>
        <TabPane tab="核验记录维护" key="maintain">
          <RecordMaintain systemId={systemId} batchTime={batchTime} reFreshVerifyTime={reFreshVerifyTime} />
        </TabPane>
      </Tabs>
    </Card>
  );
}

export default VerifyDetailsPage;
