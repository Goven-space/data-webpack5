import React, { useEffect, useState } from 'react';
import { Row, Col, Menu } from 'antd';
import ConnectConfigManagePage from './linkConfigManagePage';
import ClassifyManagePage from '../classifyManage/ClassifyManagePage';
import { getMenu, getUrlSearch } from '@tool';
import { standardManage } from '@api/dataAccessApi';

const { getClassifyOpt } = standardManage.publice;

const Index = (props) => {
  const {menuKey, location} = props
  const [menuKeyId, setMenuKeyId] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);
  const [menuData, setMenuData] = useState([]);

  useEffect(() => {
    getInitData(true);
  }, []);

  const getInitData = (init = false) => {
    //获取侧边栏数据
    getClassifyOpt({ classifyType: 'metadataLinkConfig' }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const newItems = getMenu(data, 'classifyName', 'id');
        if (init) {
          setMenuKeyId([menuKey]);
          setOpenKeys([menuKey]);
        }
        setMenuData([
          {
            label: '数据源管理',
            key: menuKey,
          },
          {
            label: '数据源查看',
            key: 'classifyRoot',
            children: [...newItems],
          },
        ]);
      }
    });
  };

  const handleMenuSelect = ({ item, key, keyPath, selectedKeys, domEvent }) => {
      setMenuKeyId(selectedKeys);
  };

  const handleExpand = openKeys => {
    setOpenKeys(openKeys);
  };

  return (
    <div className="manage-content">
      <Row gutter={16} justify="start" wrap={false}>
        <Col flex="220px" className="content-menu">
          <Menu
            mode="inline"
            items={menuData}
            onSelect={handleMenuSelect}
            openKeys={openKeys}
            selectedKeys={menuKeyId}
            onOpenChange={handleExpand}
          />
        </Col>
        <Col flex="8px" className="cutting-line" />
        <Col flex="auto" className="content-table">
          {menuKeyId[0] === 'metadataLinkConfig' ? ( //分类
            <ClassifyManagePage menuKeyId={menuKeyId[0]} getMenuData={getInitData} pMenuKey={menuKey} />
          ) : (
            <ConnectConfigManagePage menuKeyId={menuKeyId[0]} />
          )}
        </Col>
      </Row>
    </div>
  );
};
export default Index;
