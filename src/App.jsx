import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, withRouter, useHistory } from 'react-router-dom';
import LayoutPage from '@common/layout';
import MainContext from '@store';
import { getLeftMenu } from '@api/dataAccessApi/home';
import { masterDataManage } from '@api/dataAccessApi';
import TextToolTip from '@components/textToolTip';
import { AppstoreOutlined, ProfileOutlined, DatabaseOutlined } from '@ant-design/icons';
import { isArray } from 'lodash';
import {getUrlSearch} from '@tool/'
import './App.less';

const { getInfoClassifyOpt } = masterDataManage.modelManage;

function App(props) {
  const {location} = props

  const [topMenuKey, setTopMenuKey] = useState('');
  const [topMenu, setTopMenu] = useState([]);
  const [leftMenuList, setLeftMenuList] = useState({})

  const defaultMenuList = useRef({});
  const history = useHistory();

  const leftMenu = leftMenuList[topMenuKey] || [];

  const { masterClassify, setMasterClassify } = useContext(MainContext);

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    if (location.pathname) {
      const id = getUrlSearch('id', location.search);
      const pathArr = location.pathname?.split('/')?.filter(item => item) || [];
      const targetKey = id ? `${pathArr[pathArr.length - 1]}_${id}` : pathArr[pathArr.length - 1];
      pathArr[0] !== topMenuKey && setTopMenuKey(pathArr[0]);
    }
  }, [location.pathname]);

  useEffect(() => {
    topMenu.length && refreshList( masterClassify);
  }, [masterClassify]);

  const loadMenu = () => {
    getLeftMenu({ categoryId: 'core.dataasset' }).then(res => {
      const { data } = res;
      if (data && isArray(data)) {
        handleDynamicMenu(data);
      }
    });
  };

  const loadAssetsList = () => {
    getInfoClassifyOpt().then(res => {
      const { state, data } = res.data;
      if (state && isArray(data)) {
        setMasterClassify(data);
      }
    });
  };

  // 更新菜单
  const refreshList = (assetsList) => {
    //主数据查询子菜单
    const viewList = loopClassifyList(assetsList, 'masterDataView');
    //主数据维护子菜单
    const maintenanceList = loopClassifyList(assetsList, 'masterDataMaintenance');
    const { masterDataView, masterDataMaintenance } = defaultMenuList.current;
    setLeftMenuList({
      ...defaultMenuList.current,
      masterDataView: [...masterDataView, ...viewList],
      masterDataMaintenance: [...masterDataMaintenance, ...maintenanceList],
    });
  };

  const handleDynamicMenu = data => {
    let firstLayout = []; //顶部一级菜单
    let subMenuList = {}; //侧边栏子菜单
    data.forEach(i => {
      const item = {
        label: <TextToolTip text={i.label}>{i.label}</TextToolTip>,
        key: i.value,
        name: i.label,
      };
      firstLayout.push(item);
      const subMenu = i.children ? loopData(i.children, i.value) : [];
      subMenuList[i.value] = subMenu;
    });
    defaultMenuList.current = subMenuList;
    setTopMenu(firstLayout);
    firstLayout.length && loadAssetsList();
  };

  const pageChange = ({ item, key }) => {
    const parentkey =  item.props.parentkey || key
    const link = item.props.url;
    const menuName = item.props.name
    history.push(link, {menuName});
  };

  const loopData = (data, parentNodeId) => {
    const list = data.map(i => {
      const parentkey = parentNodeId || i.nodeId;
      const item = {
        label: <TextToolTip text={i.label}>{i.label}</TextToolTip>,
        key: i.value,
        name: i.label,
        icon: i.value.includes('overview') ? <ProfileOutlined /> : <AppstoreOutlined />,
      };
      if (parentNodeId) {
        item.parentkey = parentNodeId;
      } else {
        item.icon = <AppstoreOutlined />;
      }
      i.leafFlag && (item.url = i.url);
      // ['masterDataView', 'masterDataMaintenance' ].includes(i.value) && (item.children = []);
      i.children && i.children.length && (item.children = loopData(i.children, parentkey));
      return item;
    });
    return list;
  };

  const loopClassifyList = (data, parentNodeId) => {
    const list = data.map(i => {
      const parentkey = parentNodeId || '';
      const item = {
        label: <TextToolTip text={i.modelName}>{i.modelName}</TextToolTip>,
        key: `${parentNodeId}_${i.id}`,
        name: i.modelName,
        datamodelid: i.id,
        icon: !i.leaf && <DatabaseOutlined />
      };
      i.leaf && (item.url = `/${parentNodeId}?id=${i.id}`);
      i.dataSourceId && (item.datasourceid = i.dataSourceId);
      i.tableName && (item.tablename = i.tableName);
      parentNodeId && (item.parentkey = parentNodeId);
      i.children && (item.children = loopClassifyList(i.children, parentkey));
      return item;
    });
    return list;
  };

  const onTopMenuClick = ({ key }) => {
    setTopMenuKey(key)
    const leftMenu =  leftMenuList[key] || []
    if (leftMenu[0]) {
      let defaultKey = findFirstLeaf(leftMenu[0]);
      history.push(defaultKey.url);
    }
  };

  const getMenuConfig = (targetKey, menuList = []) => {
    let item  = null
    menuList.some(i => {
      if (i.children) {
        item = getMenuConfig(targetKey, i.children)
        return Boolean(item) 
      }
      if (i.key.includes(targetKey)) {
        item = i;
        return true;
      }
      return false
    })
    return item
  }

  // 查找第一个叶子节点
  const findFirstLeaf = obj => {
    if (obj.children) {
      return findFirstLeaf(obj.children[0]);
    }
    return obj;
  };

  return (
    <LayoutPage
      topMenu={topMenu}
      leftMenu={leftMenu}
      topSelectedKeys={[topMenuKey]}
      onMenuClick={onTopMenuClick}
      leftMenuClick={pageChange}
    />
  );
}

export default withRouter(App);
