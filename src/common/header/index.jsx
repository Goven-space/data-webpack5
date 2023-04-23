import React, { useEffect, useState, useMemo } from 'react';
import { useHistory, Link, withRouter } from 'react-router-dom';
import { Layout, Menu, Button, Tooltip, Popover, Avatar, Modal, Image, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import imgUrl from '../../assets/logo-w.png';
import avatarUrl from '@/assets/avatar.png';
import { getUsername, clearAll } from '@tool/cookies';
import { getEnvironmentInfo } from '@tool';
import { RollbackOutlined } from '@ant-design/icons';
import IconFont from '@components/iconFont';
import UserProfile from './UserProfile';
import ChangeServer from './ChangeServer';
import { getSysInfo } from '@api/dataAccessApi/home';

const { Header } = Layout;
const originUrl = window.location.origin

const HeaderPage = props => {
  const {
    headerContent,
    needCollapsed,
    menu,
    onMenuClick,
    selectedKeys,
    toggle,
    leftWidth,
    collapsed,
    headerBtn,
    configData,
  } = props;
 
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentServerHost, setCurrentServerHost] = useState('');
  const [userInfo, setUserInfo] = useState('');
  const [environmentInfo, setEnvironmentInfo] = useState('');

  const history = useHistory()

  const { homeLogo, logoName = '', systemName = '' } = configData;
  const configTitle =
    (logoName === 'false' || logoName === '') && (systemName === 'false' || systemName === '') ? false : true;
  const headerConfigBtn = { ...headerBtn, logout: true };

  useEffect(() => {
    setCurrentServerHost(localStorage.getItem('currentServerHost'));
    setUserInfo(getUsername());
    getEvnInfo();
  }, []);

  const onClick = ({ item, key, keyPath, domEvent }) => {
    if (onMenuClick) {
      onMenuClick({ item, key, keyPath, domEvent });
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  /* const getMenu = (menu=[]) => {
    return menu.map((item) => {
      if (item.children?.length) {
        return (
          <Menu.SubMenu title={item.label} key={item.key}>
            {getMenu(item.children)}
          </Menu.SubMenu>
        );
      } else {
        return <Menu.Item key={item.key}>{item.label}</Menu.Item>;
      }
    });
  };
 */

  const getMenu = (menu = []) => {
    return menu.map(item => ({
      label: item.name,
      key: item.key,
    }));
  };

  const collapsedChange = () => {
    toggle();
  };

  const menuData = useMemo(() => {
    return getMenu(menu);
  }, [menu]);

  const headerMenuClick = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const topMenuClick = type => {
    //顶部菜单点击事件
    function showDialog(type) {
       setModalType(type);
       setVisible(true);
    }
    const eventList = {
      logout: () => {
        clearAll();
        window.location.href = `${originUrl}/restcloud/admin/login`;
      },
      home: () => {
        window.location.href = `${originUrl}/restcloud/admin`;
      },
      back: () => {
        history.push('/home');
      },
      profile: () => {
        showDialog('profile');
      },
      changeServer: () => {
         showDialog('changeServer');
      }
    };
    eventList[type]()
  };

  const getEvnInfo = () => {
    let evn = window.localStorage.getItem('environment');
    if (!evn) {
      getSysInfo().then(data => {
        const { environment } = data.data;
        if (environment) {
          evn = environment;
          window.localStorage.setItem('environment', environment);
        }
      });
    }
    setEnvironmentInfo(evn);
  };

  const modalList = {
    profile: {
      modalTitle: '帐号信息',
      modalForm: <UserProfile closeModal={handleCancel} />,
    },
    changeServer: {
      modalTitle: '切换服务器',
      modalForm: <ChangeServer closeModal={handleCancel} />,
    },
  };

  return (
    <>
      <Modal
        title={modalList[modalType]?.modalTitle}
        maskClosable={false}
        visible={visible}
        destroyOnClose
        footer={null}
        width={760}
        onOk={handleCancel}
        onCancel={handleCancel}
      >
        {modalList[modalType]?.modalForm}
      </Modal>
      <Header className="layout-header">
        <div className="header-content">
          {/* logo */}
          <div
            className="page-header-logo"
            style={{ width: leftWidth }}
            onClick={() => {
              topMenuClick('home');
            }}
          >
            {homeLogo ? (
              <div className="configData-header-logo" style={{ width: configTitle ? 80 : leftWidth }}>
                <img className="configData-img" src={homeLogo} />
              </div>
            ) : (
              <IconFont icon="LOGO" customClassName="page-header-logo-icon" size={88} />
            )}
            {(!homeLogo || configTitle) && !collapsed && (
              <div className="page-header-logo-text">
                <span className="text-title">{configTitle ? logoName : 'RestCloud'}</span>
                <span className="text-dec">{configTitle ? systemName : 'iPaaS企业集成平台'}</span>
              </div>
            )}
          </div>
          <div className="header-right-content">
            {menu && menu.length ? (
              <div className="header-menu">
                <Menu
                  style={{ lineHeight: '60px' }}
                  onClick={onClick}
                  mode="horizontal"
                  selectedKeys={selectedKeys}
                  items={menuData}
                />
              </div>
            ) : (
              <span></span>
            )}
            {headerContent ? (
              headerContent
            ) : (
              <div className="header-btn">
                <span
                  className="page-header-env-text"
                  style={{
                    color: '#fff',
                  }}
                >
                  {environmentInfo}
                </span>
                {headerConfigBtn.home && (
                  <Tooltip placement="bottom" title="首页">
                    <span
                      className="topHeaderButton-blue"
                      onClick={() => {
                        topMenuClick('home');
                      }}
                    >
                      <IconFont icon="home1" size={18} />
                    </span>
                  </Tooltip>
                )}
                {/* <Tooltip placement="bottom" title="消息提示">
                  <span className="topHeaderButton-blue">
                    <IconFont icon="notification-bing" size={20} />
                  </span>
                </Tooltip> */}
                <div className="header-userInfo">
                  <div className="header-userInfo-dropdown">
                    <Popover
                      placement="bottomRight"
                      overlayClassName="header-userInfo-pop"
                      content={
                        <div>
                          <div className="header-userInfo-btn">
                            <div className="header-userInfo-serve">当前服务器</div>
                            <div>{currentServerHost}</div>
                          </div>
                          <hr
                            style={{
                              backgroundColor: '#EBEDF0',
                              height: 1,
                              border: 'none',
                            }}
                          />
                          <div className="header-userInfo-content">
                            <div
                              className="style"
                              onClick={e => {
                                topMenuClick('changeServer');
                              }}
                            >
                              <IconFont icon="qiehuan1" customClassName="header-userInfo-icon" size={14} />
                              <Button type="link" className="header-userInfo-btn">
                                切换
                              </Button>
                            </div>
                            <div
                              className="style"
                              onClick={e => {
                                e.stopPropagation();
                                topMenuClick('profile');
                              }}
                            >
                              <IconFont
                                icon="wodezhanghao"
                                size={14}
                                customClassName="header-userInfo-icon"
                              />
                              <Button type="link" className="header-userInfo-btn">
                                我的账号
                              </Button>
                            </div>
                            <div
                              className="style"
                              onClick={e => {
                                topMenuClick('logout');
                              }}
                            >
                              <IconFont icon="a-daoru1" size={14} customClassName="header-userInfo-icon" />
                              <Button type="link" className="header-userInfo-btn">
                                退出
                              </Button>
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <span>
                        <Avatar
                          src={<Image src={avatarUrl} preview={false} />}
                          size={30}
                          style={{
                            marginRight: '10px',
                            backgroundColor: '#7265e6',
                          }}
                        />
                        <span className="header-userInfo-text">{userInfo}</span>
                      </span>
                    </Popover>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Header>
    </>
  );
};
HeaderPage.propsTypes = {
  menu: PropTypes.array,
};
HeaderPage.defaultProps = {
  menu: [],
};
export default HeaderPage;
