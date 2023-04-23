import { ConfigProvider } from 'antd';
import zh_CN from 'antd/es/locale/zh_CN';
import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Redirect, Route, Switch, HashRouter } from 'react-router-dom';
import './index.less';
import { MainStore } from './store';
import App from './App.jsx';
import './assets/icon-font/iconfont.css';
import Login from '@pages/login'
import 'dayjs/locale/zh-cn';

const root = createRoot(document.getElementById('app'));
root.render(<ConfigProvider locale={zh_CN}>
    <MainStore>
      <HashRouter>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/" component={App} />
        </Switch>
      </HashRouter>
    </MainStore>
  </ConfigProvider>);
