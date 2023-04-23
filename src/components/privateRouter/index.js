import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { getToken } from '@tool/cookies';
const PrivateRouter = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={routeProps => {
        return getToken() ? <Component {...routeProps} {...rest} /> : <Redirect to="/masterDataView/overview" />;
      }}
    />
  );
};
export default PrivateRouter;
