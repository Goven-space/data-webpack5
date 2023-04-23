import React, { useEffect, useState, useRef } from 'react';
import { Typography, Card, Tabs, Button, Space, TreeSelect, Image } from 'antd';
import { standardManage } from '@api/dataAccessApi';
import DataCollectionContent from './dataCollectionContent/DataCollectionContent';
import RecycleBin from './RecycleBin';
import { showInfo } from '@tool';
import createTableUrl from '@img/icon/createTable.png';
import systemTableUrl from '@img/icon/systemTable.png';
import notCreateTableUrl from '@img/icon/notCreateTable.png';
import syncFiledTableUrl from '@img/icon/syncFiledTable.png';
import updateTableUrl from '@img/icon/updateTable.png';
import recycleBin from '@img/icon/recycleBin.png';


const { getInfo, getAssetsDataSource, updateMoodelVerifyData } = standardManage.systemModelingApi;

const { Title } = Typography;
const { TabPane } = Tabs;
const standard = {
  summaryTable: { title: '总模型数', color: 'success', key: 'summaryTable', img: systemTableUrl },
  notVerifyTable: {
    title: '未核验表',
    color: 'warning',
    key: 'notVerifyTable',
  },
  notCreateTable: {
    title: '未创建表',
    tabTitle: '未创建表',
    color: 'secondary',
    key: 'notCreateTable',
    img: notCreateTableUrl,
  },
  createTable: {
    title: '已创建表',
    tabTitle: '已创建表',
    color: 'success',
    key: 'createTable',
    img: createTableUrl,
  },
  notMatchTable: { title: '不匹配表', color: 'danger', key: 'notMatchTable' },
  nonstandardTable: {
    title: '非标准建表数',
    color: 'danger',
    key: 'nonstandardTable',
  },
  syncFiledTable: {
    title: '字段待同步表',
    tabTitle: '待同步表',
    color: 'secondary',
    key: 'syncFiledTable',
    img: syncFiledTableUrl,
  },
  updateTable: {
    title: '表名待修改',
    tabTitle: '表名待修改',
    color: 'secondary',
    key: 'updateTable',
    img: updateTableUrl,
  },
  recycleTable: {
    title: '回收站表',
    tabTitle: '回收站表',
    color: 'secondary',
    key: 'recycleTable',
    img: recycleBin,
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
  const [listMode, setListMode] = useState('Card');

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

  const reLoad = () => {
    getInfoData(() => {
      tabContentRef.current.getData();
    });
  }

  return (
    <div>
      <div className="DataCollection-content">
        <div className="content-top-list">
          {data.map(item => (
            <div className="top-list-item" key={item.key}>
              <div>
                <div className="top-list-title">{item.title}</div>
                <div className="top-list-value">
                  <span>{item.count}</span>
                </div>
              </div>
              <div>
                <Image src={item.img} preview={false} width={45} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Card bodyStyle={{ paddingTop: 5 }}>
        {/* <Space align="baseline" style={{ marginBottom: '20px' }}>
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
          <Button onClick={reLoad} disabled={!dataSourceId}>
            重新加载
          </Button>
        </Space> */}
        <Tabs
          defaultActiveKey="notCreateTable"
          size="large"
          onChange={onTabChange}
          activeKey={activeKey}
          destroyInactiveTabPane
        >
          {data.map((item, index) =>
            !['recycleTable', 'summaryTable'].includes(item.key) ? (
              <TabPane tab={`${item.tabTitle}(${item.count})`} key={item.key}>
                <DataCollectionContent
                  time={time}
                  dataSourceId={dataSourceId}
                  classifyId={classifyId}
                  tabKey={item.key}
                  ref={tabContentRef}
                  getInfoData={getInfoData}
                  count={item.count}
                  listMode={listMode}
                  setListMode={setListMode}
                />
              </TabPane>
            ) : (
              item.key === 'recycleTable' && (
                <TabPane tab={`${item.tabTitle}(${item.count})`} key={item.key}>
                  <RecycleBin
                    theirTopClassifyId={menuSelect}
                    dataSourceId={dataSourceId}
                    getInfoData={getInfoData}
                    listMode={listMode}
                    setListMode={setListMode}
                  />
                </TabPane>
              )
            )
          )}
        </Tabs>
      </Card>
    </div>
  );
}
