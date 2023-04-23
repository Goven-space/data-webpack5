import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";

import LayoutPage from "@common/layout";

import { standardManage, home } from "@api/dataAccessApi";
import { useHistory } from "react-router-dom";
import "./index.less"

const Index = ({ name, routes, topMenu }) => {
  const [menuKey, setMenuKey] = useState();
  const [openMenu, setOpenMenu] = useState([]);
 
  const history = useHistory();

  const leftMenuChange = ({ item, key, keyPath, domEvent }) => {
    setMenuKey(key);
  };

  const pageChange = ({ item, key }) => {
    const targetItem = topMenu.find(item => item.key === key)
    const link = targetItem?.path
    history.push(link);
  }

  return (
    <LayoutPage
      leftMenuClick={useCallback(leftMenuChange, [])}
      LeftMenu={routes}
      topMenu={topMenu}
      defaultLeftOpenMenu={openMenu}
      headerBtn={{ home: true }}
      onMenuClick={pageChange}
    />
  );
};

export default Index;
