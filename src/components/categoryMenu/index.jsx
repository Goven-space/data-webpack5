import React, { useState, useEffect, useRef } from 'react';
import { Menu } from 'antd';
import './index.less';

function CategoryMenu(props) {
  const { onClick, items } = props;

  const onMenuClick = ({ item, key, keyPath, domEvent }) => {
    onClick({ item, key, keyPath, domEvent });
  };

  return <Menu items={items} onClick={onMenuClick} />;
}

export default CategoryMenu;
