import React from 'react';
import { Card, Typography, Tabs } from 'antd';
import RecordMaintain from './RecordMaintain';
import IssueRecordView from './IssueRecordView';
import QualityAnalysePage from './QualityAnalysePage';
import ModelInfoPage from './ModelInfoPage';
import FieldInfoPage from './FieldInfoPage';

const Text = Typography.Text;
const TabPane = Tabs.TabPane;

function VerifyDetailsPage(props) {
  const { dataModelId, batchTime, showView } = props;


  return (
    <Card style={{ marginTop: 20, borderRadius: 10 }} bodyStyle={{ padding: '10px 20px' }}>
      <Text style={{ fontSize: 16 }}>核验详情</Text>
      <Tabs size="large" defaultActiveKey="rule" destroyInactiveTabPane>
        <TabPane tab="模型信息" key="model">
          <ModelInfoPage dataModelId={dataModelId} batchTime={batchTime} />
        </TabPane>
        <TabPane tab="字段信息" key="field">
          <FieldInfoPage dataModelId={dataModelId} batchTime={batchTime} />
        </TabPane>
        <TabPane tab="质量分析" key="analyse">
          <QualityAnalysePage dataModelId={dataModelId} showView={showView} />
        </TabPane>
        <TabPane tab="问题记录数查看" key="question">
          <IssueRecordView dataModelId={dataModelId} batchTime={batchTime} />
        </TabPane>
        <TabPane tab="核验记录维护" key="maintain">
          <RecordMaintain dataModelId={dataModelId} />
        </TabPane>
      </Tabs>
    </Card>
  );
}

export default VerifyDetailsPage;
