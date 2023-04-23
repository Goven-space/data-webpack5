import React, { useEffect, useState, useRef } from 'react';
import { Modal, Row, Col, Tree, Form, Button, Input, Tabs, Menu } from 'antd';
import { metadataManage } from '@api/dataAccessApi';
import DataCollection from './DataCollection';
import { getMenu } from '@tool';

const { getListParentByType } = metadataManage.systemModeling;

const { TabPane } = Tabs;
const { Search } = Input;

export default function HomePage({ menuKey }) {
  const [menuKeyId, setMenuKeyId] = useState('');
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
    getListParentByType({ classifyType: 'metadataLabelSet' }).then(res => {
      const { state, data } = res.data;
      if (state) {
        if(init){
          setMenuKeyId([data[0]?.id || '']);
          setOpenKey([menuKey]);
        }
        const newData = getMenu(data, 'classifyName', 'id')
        setMenuData([...newData]);
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
            openKeys={openKey}
            selectedKeys={menuKeyId}
            onOpenChange={handleExpand}
          />
        </Col>
        <Col flex="8px" className="cutting-line" />
        <Col flex="auto" className="content-table">
          <div className="verificationPage">
            <div className="verificationPage-content">
              <DataCollection menuSelect={menuKeyId[0]} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
