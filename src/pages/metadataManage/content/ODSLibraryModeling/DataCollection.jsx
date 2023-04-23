import React, { useEffect, useState, useRef } from 'react';
import { Row, Typography, Card, Tabs, Space, TreeSelect, Button } from 'antd';
import { metadataManage } from '@api/dataAccessApi';
import DataCollectionContent from './dataCollectionContent/DataCollectionContent';
import ResultPage from './dataCollectionContent/ResultPage';
import { showInfo } from '@tool';

const { getInfo, getAssetsDataSource, updateMoodelVerifyData } = metadataManage.systemModeling;
const { Title } = Typography;
const { Meta } = Card;
const { TabPane } = Tabs;

const standard = {
  summaryTable: { title: '系统总表数', color: 'success', key: 'summaryTable' },
  notVerifyTable: {
    title: '未核验表数',
    color: 'warning',
    key: 'notVerifyTable',
  },
  notCreateTable: {
    title: '系统未创建表数',
    tabTitle: '未创建表数',
    color: 'secondary',
    key: 'notCreateTable',
  },
  createTable: { title: '系统已创建表数', tabTitle: '已创建表数', color: 'success', key: 'createTable' },
  notMatchTable: { title: '不匹配表数', color: 'danger', key: 'notMatchTable' },
  nonstandardTable: {
    title: '非标准建表数',
    color: 'danger',
    key: 'nonstandardTable',
  },
};

export default function DataCollection({ menuSelect }) {
  const tabContentRef = useRef();
  const [title, setTitle] = useState('');
  const [data, setData] = useState([]);
  const [time, setTime] = useState('');
  const [activeKey, setActiveKey] = useState('notCreateTable');
  const [dataSourceTree, setDataSourceTree] = useState([]);
  const [dataSourceId, setDataSourceId] = useState('');
  const [classifyId, setClassifyId] = useState('');

  useEffect(() => {
    loadTreeData();
  }, []);

  useEffect(() => {
    menuSelect && getInfoData();
  }, [menuSelect]);

  const loadTreeData = () => {
    getAssetsDataSource().then(res => {
      const { data, state } = res.data;
      if (state) {
        let treeData = treeDataTransform(data);
        treeData = treeData.length ? treeData : [];
        setDataSourceTree(treeDataTransform(data));
      }
    });
  };

  const treeDataTransform = data => {
    const arr = data.map(item => {
      return {
        value: item.id,
        title: item.children ? item.text : `${item.text}-${item.label}`,
        id: item.id,
        isLeaf: !item.children,
        selectable: !item.children,
        children: item.children && treeDataTransform(item.children),
      };
    });
    return arr;
  };

  const getInfoData = callback => {
    getInfo({ classifyId: menuSelect }).then(res => {
      const { state, data } = res.data;
      if (state && data) {
        setTitle(`${data.dataSourceName}-${data.dataSourceId}`);
        setDataSourceId(data.dataSourceId);
        setTime(data.scanTime);
        setClassifyId(menuSelect);
        const keys = Object.keys(standard);
        const newData = [];
        for (const key in data) {
          const item = keys.find(item => item === key);
          if (item) {
            newData.push({
              ...standard[item],
              count: data[key],
              notVerifyCount:
                key === 'notVerifyTable'
                  ? data['notVerifyTableDecline']
                  : key === 'notCreateTable'
                  ? data['notCreateTableDecline']
                  : key === 'notMatchTable'
                  ? data['notMatchTableDecline']
                  : undefined,
            });
          }
        }
        setData(newData);
      }
      callback && callback();
    });
  };

  const onTabChange = key => {
    setActiveKey(key);
  };

  const handleDataSourceChange = value => {
    setDataSourceId(value);
  };

  const handleSetSourceData = () => {
    updateMoodelVerifyData({ classifyId: menuSelect, dataSourceId: dataSourceId }).then(res => {
      const { msg, state } = res.data;
      if (state) {
        showInfo(msg);
      }
      getInfoData(() => {
        tabContentRef.current.getData();
      });
    });
  };

  return (
    <>
      <div className="DataCollection-content">
        <Space align="baseline">
          <Title level={5}>建模核验数据源：</Title>
          <TreeSelect
            style={{ width: 400 }}
            treeData={dataSourceTree}
            placeholder="暂未配置数据源"
            onChange={handleDataSourceChange}
            value={dataSourceId || undefined}
            showSearch
            filterTreeNode={(inputValue, treeNode) =>
              treeNode.title.toLowerCase().includes(inputValue.toLowerCase())
            }
          />
          <Button type="primary" onClick={handleSetSourceData}>
            配置数据源
          </Button>
        </Space>
        <Row>
          <Space>
            {data.map((item, index) => (
              <Card bordered={false} key={item.id}>
                <Meta
                  title={`${item.title}`}
                  description={
                    <Title type={item.color} level={4}>
                      <Space>
                        <span>{item.count}</span>
                      </Space>
                    </Title>
                  }
                />
              </Card>
            ))}
          </Space>
        </Row>
      </div>
      <div>
        <Tabs
          defaultActiveKey="notCreateTable"
          onChange={onTabChange}
          activeKey={activeKey} 
          destroyInactiveTabPane
        >
          {data.map((item, index) =>
            item.key !== 'summaryTable' ? (
              <TabPane tab={`${item.tabTitle}(${item.count})`} key={item.key}>
                <DataCollectionContent
                  time={time}
                  dataSourceId={dataSourceId}
                  classifyId={classifyId}
                  tabKey={activeKey}
                  ref={tabContentRef}
                  getInfoData={getInfoData}
                  count={item.count}
                />
              </TabPane>
            ) : null
          )}
          <TabPane tab="建模日志" key="logTable">
            <ResultPage classifyId={classifyId} scanTime={time} />
          </TabPane>
        </Tabs>
      </div>
    </>
  );
}
