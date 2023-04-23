import React, { useEffect, useState, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { Layout, Menu, Breadcrumb } from 'antd';
import { Link, Switch, withRouter } from 'react-router-dom';
import { searchTreeData, getConfigData, getUrlSearch } from '@tool';
import FooterPage from '../footer';
import HeaderPage from '../header';
import MainContext from '@store';
import ContainerMain from '../container';
import './index.less';
import IconFont from '@components/iconFont';

const { Content, Sider, Footer } = Layout;

const LayoutPage = props => {
  const {
    otherContent,
    content,
    leftMenu,
    topMenu,
    needCollapsed,
    menuPath,
    topSelectedKeys,
    defaultLeftMenu,
    defaultLeftOpenMenu,
    allRootSubmenuKeys,
    leftMenuClick,
    menuContent,
    leftOpt,
    location,
    onMenuClick,
  } = props;
  const [leftWidth, setLeftWidth] = useState(220);
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [rootSubmenuKeys, setRootSubmenuKeys] = useState(allRootSubmenuKeys || []);
  const [configData, setConfigData] = useState({ homeLogo: false });
  const [collapsedHover, setCollapsedHover] = useState(false);
  const [siderClassName, setSiderClassName] = useState('layout-side-lite');

  const { setTargetMenuItem } = useContext(MainContext);

  useEffect(() => {
    initConfig();
  }, []);

  useEffect(() => {
    if (location.pathname) {
      init();
    }
  }, [location.pathname]);

  useEffect(() => {
    leftMenu.length && init();
  }, [leftMenu]);

  const initConfig = () => {
    let data = getConfigData(true);
    if (data && data !== 'undefined' && JSON.stringify(data) !== '{}') {
      setConfigData(data);
    }
    let collapsed = localStorage.getItem('collapsed');
    setLeftWidth(collapsed === 'true' ? 80 : 220);
    setCollapsed(collapsed === 'true' ? true : false);
    const name = localStorage.getItem('versionType') === '1' ? 'layout-side-primeval' : 'layout-side-lite';
    setSiderClassName(name);
  };

  const getMenuConfig = (targetKey, menuList = []) => {
    let item = null;
    menuList.some(i => {
      if (i.children) {
        item = getMenuConfig(targetKey, i.children);
        return Boolean(item);
      }
      if (i.key.includes(targetKey)) {
        item = i;
        return true;
      }
      return false;
    });
    return item;
  };

  // 路由跳转页面初始化
  const init = () => {
    const categoryId = getUrlSearch('id', location.search);
    const pathArr = location.pathname?.split('/')?.filter(item => item) || [];
    let targetKey = categoryId ? `${pathArr[pathArr.length - 1]}_${categoryId}` : pathArr[pathArr.length - 1];
    targetKey = targetKey === 'overview' ? `${pathArr[0]}_${targetKey}` : targetKey;
    refreshPage(targetKey);
  };

  // 更新选中的菜单,展开的菜单,面包屑
  const refreshPage = targetKey => {
    const openMenuList = getOpenMenuProps(leftMenu, targetKey) || [];
    let openKeys = [];
    let breadcrumb = [];
    openMenuList.forEach(item => {
      openKeys.push(item.key);
      breadcrumb.push(item.name);
    });
    setBreadcrumb(breadcrumb);
    setOpenKeys(openKeys);
    setSelectedKeys(openKeys);
    let item = getMenuConfig(targetKey, leftMenu);
    item && setTargetMenuItem(item);
  };

  const onLeftMenuClick = ({ item, key, keyPath, domEvent }) => {
    setSelectedKeys([key]);
    refreshPage(key);
    if (leftMenuClick) {
      leftMenuClick({ item, key, keyPath, domEvent });
    }
  };

  const toggle = () => {
    localStorage.setItem('collapsed', !collapsed);
    setLeftWidth(collapsed ? 220 : 80);
    setCollapsed(!collapsed);
  };

  const onOpenChange = keys => {
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const getOpenMenuProps = (treeList = [], key) => {
    let data;
    (treeList || []).map(i => {
      if (i.key === key) {
        data = [{ key: i.key, name: i.name }];
      } else {
        const child = getOpenMenuProps(i.routes || i.children, key);
        if (child) {
          data = [{ key: i.key, name: i.name }, ...child];
        }
      }
    });
    return data;
  };

  const handleCollapsedHover = flag => {
    setCollapsedHover(flag);
  };

  return (
    <Layout>
      <HeaderPage
        menu={topMenu}
        // toggle={toggle}
        leftWidth={leftWidth}
        collapsed={collapsed}
        onMenuClick={onMenuClick}
        selectedKeys={topSelectedKeys}
        selectedKeys={topSelectedKeys}
        needCollapsed={needCollapsed}
        headerBtn={{ home: true }}
        configData={configData}
      />
      <Layout style={{ marginLeft: leftWidth }}>
        <Sider width={leftWidth} className={siderClassName} collapsible collapsed={collapsed} trigger={null}>
          {configData.menuCollapse !== 'false' && (
            <div className="page-header-collapsed" style={{ left: leftWidth - 15 }} onClick={toggle} onMouseEnter={() => handleCollapsedHover(true)} onMouseLeave={() => handleCollapsedHover(false)}>
              <span>
                <IconFont icon={!collapsed && !collapsedHover ? 'tighten_off' : collapsed && !collapsedHover ? 'unfold_off1' : !collapsed && collapsedHover ? 'tighten_on_1' : 'unfold_off_1'} size={14} />
              </span>
            </div>
          )}
          {menuContent ? (
            menuContent
          ) : (
            <Menu
              inlineIndent={16}
              mode="inline"
              width={leftWidth}
              className={collapsed ? '' : 'layout-menu'}
              openKeys={openKeys}
              selectedKeys={selectedKeys}
              onClick={onLeftMenuClick}
              onOpenChange={onOpenChange}
              inlineCollapsed={collapsed}
              {...leftOpt}
              items={leftMenu}
              theme="light"
            />
          )}
        </Sider>
        <div className="content-breadcrumb">
          <Breadcrumb className="layout-content-breadcrumb">
            {breadcrumb?.map(item => {
              return <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>;
            })}
          </Breadcrumb>
        </div>
        <Content className="layout-content">{otherContent ? otherContent : <ContainerMain pathname={location.pathname} />}</Content>
      </Layout>
      <Footer className="footer-content">
        <FooterPage />
      </Footer>
    </Layout>
  );
};

LayoutPage.propTypes = {
  leftMenu: PropTypes.array,
  topMenu: PropTypes.array,
  menuPath: PropTypes.array,
  defaultLeftMenu: PropTypes.array,
  leftOpt: PropTypes.object,
};
LayoutPage.defaultProps = {
  leftMenu: [],
  topMenu: [],
  menuPath: [],
  defaultLeftMenu: [],
  leftOpt: {},
};

export default withRouter(LayoutPage);
