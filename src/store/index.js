import * as api from '@api';
import { createContext, useState, useReducer, useRef } from 'react';

const MainContext = createContext();
const { Provider } = MainContext;

export const MainStore = props => {
  const [routesList, setRoutesList] = useState([]);
  const [baseURL, setBaseURL] = useState(api.baseURL);
  const [loading, setLoading] = useState(false);
  const [msgData, setMsgData] = useState();
  const [type, setType] = useState('');
  const [masterClassify, setMasterClassify] = useState([]); //主数据查看分类菜单
  const [targetMenuItem, setTargetMenuItem] = useState({}) 

  const defaultDataSource = 'mdm.datasource';

  return (
    <Provider
      value={{
        routesList,
        setRoutesList,
        baseURL,
        setBaseURL,
        loading,
        setLoading,
        msgData,
        setMsgData,
        type,
        setType,
        masterClassify,
        setMasterClassify,
        defaultDataSource,
        targetMenuItem,
        setTargetMenuItem,
      }}
    >
      {props.children}
    </Provider>
  );
};

export default MainContext;
