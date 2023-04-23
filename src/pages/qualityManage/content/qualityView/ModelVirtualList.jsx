import React, { useEffect, useState, useRef } from 'react';
import { List, Button } from 'antd';
import {} from '@ant-design/icons';
import { standardManage } from '@api/dataAccessApi';
import VirtualList from 'rc-virtual-list';

const { getList } = standardManage.informationManageApi;


function ModelVirtualList(props) {
  const { theirTopClassifyId, onClassifyClick, treeKey } = props;

  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);

  const pages = useRef(0);

  useEffect(() => {
    loadData(1);
  }, []);

  const loadData = (pageNo = current) => {
    let params = {
      pageNo,
      pageSize: 20,
      filters: { theirTopClassifyId, type: 'dataModel' },
      sort: 'sort',
      order: 'asc',
    };
    getList(params).then(res => {
      const { state, data } = res.data;
      if (state) {
        const { rows, total, pageNo, pageSize, totalPages } = res.data;
        let list = rows.map(item => ({
          ...item,
          key: item.id,
          name: item.modelName,
        }));
        setTotal(total);
        pages.current = totalPages;
        list = pageNo === 1 ? list : dataSource.concat(list);
        setDataSource(list);
        setCurrent(pageNo);
      }
    });
  };

  const appendData = () => {
    if (current < pages.current) {
      const pageNo = current + 1;
      setCurrent(pageNo);
      loadData(pageNo);
    }
  };

  const containerHeight = dataSource.length > 19 ? 500 : dataSource.length * 47;

  const onScroll = e => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === containerHeight) {
      appendData();
    }
  };

  return (
    <div>
      <List split={false}>
        <VirtualList
          data={dataSource}
          itemHeight={47}
          height={containerHeight}
          itemKey="key"
          onScroll={onScroll}
        >
          {item => (
            <List.Item key={item.key} style={{ height: 47 }}>
              <Button
                className={treeKey === item.id ? 'classify-item-selected' : ''}
                type="text"
                style={{ width: '100%', paddingLeft: '25%' }}
                onClick={() => onClassifyClick({ ...item, theirTopClassifyId })}
              >
                {item.name}
              </Button>
            </List.Item>
          )}
        </VirtualList>
      </List>
    </div>
  );
}

export default ModelVirtualList;
