import { ConfigProvider } from 'antd';
import zh_CN from 'antd/es/locale/zh_CN';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Redirect, Route, Switch, HashRouter } from 'react-router-dom';
import './index.less';
import { MainStore } from './store';
import App from './App.jsx';
import './assets/icon-font/iconfont.css';
import Login from '@pages/login'
import 'dayjs/locale/zh-cn';
import 'antd/dist/reset.css';

const root = createRoot(document.getElementById('root'));
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