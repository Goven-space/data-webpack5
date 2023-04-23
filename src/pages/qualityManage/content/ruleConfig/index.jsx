import React, { useEffect, useState, useRef } from 'react';
import { Tabs, Input, Tree, Button, Menu, Row, Col } from 'antd';
import { standardManage } from '@api/dataAccessApi';
import { getMenu } from '@/tool';
import ModelConfigManage from './modelConfigManage/ModelConfigManage';

const { getRootClassify } = standardManage.systemModelingApi;

const { TabPane } = Tabs;
const { Search } = Input;

export default function HomePage({ menuKey }) {
  const [menuKeyId, setMenuKeyId] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [openKey, setOpenKey] = useState([]);

  useEffect(() => {
    getInitData(true);
  }, []);

  const getDefOpenMenu = (arr = [], data) => {
    let name = '';
    arr.forEach((item, index) => {
      if (index === 0) {
        data.push(item.id);
        name = item.classifyName;
        if (item.children && item.children.length) {
          name = getDefOpenMenu(item.children, data);
        }
      }
    });
    return name;
  };

  const getInitData = (init = false) => {
    //获取侧边栏数据
    getRootClassify().then(res => {
      const { state, data } = res.data;
      if (state) {
        const newItems = getMenu(data, 'modelName', 'id');
        if (init) {
          // setOpenKey([menuKey]);
          setMenuKeyId([data[0]?.id || '']);
        }

        setMenuData([...newItems]);
      }
    });
  };

  const handleMenuSelect = ({ item, key, keyPath, selectedKeys, domEvent }) => {
    setMenuKeyId(selectedKeys);
  };

  const handleExpand = openKeys => {
    setOpenKey(openKeys);
  };

  return (
    <div className="manage-content">
      <Row gutter={16} justify="start" wrap={false}>
        <Col flex="220px" className="content-menu info-content">
          <Menu
            mode="inline"
            items={menuData}
            onSelect={handleMenuSelect}
            openkey={openKey}
            selectedKeys={menuKeyId}
            onOpenChange={handleExpand}
          />
        </Col>
        <Col flex="8px" className="cutting-line" />
        <Col flex="auto" className="content-table">
            <ModelConfigManage menuSelect={menuKeyId[0]} />
        </Col>
      </Row>
    </div>
  );
}
