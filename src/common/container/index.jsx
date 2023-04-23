import React, { useEffect, useMemo } from 'react';
import { Switch, Redirect } from 'react-router-dom';
import PrivateRouter from '@components/privateRouter';
import { getComponents } from './components';

export default function Index({ pathname }) {
  useEffect(() => {}, []);

  const Components = useMemo(() => {
    return getComponents(pathname);
  }, [pathname]);
  return (
    <div className="content-main">
      {
        <Switch>
          {Components.map(item => {
            return <PrivateRouter exact key={item.menuKey} {...item} />;
          })}
          <Redirect from="/" to="/masterDataView/overview" exact />
        </Switch>
      }
    </div>
  );
}
