import React, { useState, useEffect } from 'react';
import { List } from 'antd';
import { isArray } from 'lodash';
import { qualityManageApi } from '@api/dataAccessApi';
import TextTooltip from '@components/textToolTip';

const { getDataModelChange } = qualityManageApi.qualityMonitor;

const data = [
  {
    systemName: '主数据222222222222222222222222',
    dataModelName: 'Books [书籍]33333333333333333333333',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
  {
    systemName: '主数据',
    dataModelName: 'Books [书籍]',
    currentChangeDataCount: 4079,
    lastChangeDataCount: 0,
  },
];
function ImproveInfoPage(props) {
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    getDataModelChange().then(res => {
      const { data } = res;
      if (isArray(data)) {
        setDataSource(data);
      }
    });
  };

  return (
    <List
      className="improve-info-content"
      dataSource={dataSource}
      rowKey={record => record.systemName}
      renderItem={item => (
        <List.Item>
          <div className="improve-info-item">
            <TextTooltip
              placement="topLeft"
              text={`${item.systemName} - ${item.dataModelName} -  改进记录数[${item.currentChangeDataCount}] - 时间[${item.currentChangeDataTime}]`}
            />
          </div>
        </List.Item>
      )}
    />
  );
}

export default ImproveInfoPage;
