import { Input, Table, Transfer } from "antd";
import difference from "lodash/difference";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

const NewTableTransfer = (props, ref) => {
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [targetKeys, setTargetKeys] = useState([]);
  const [rightData, setRightData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [rightSelectedData, setRightSelectedData] = useState([]);
  const { leftColumns, rightColumns, getApiList, initTargetData } = props;
  const [searchValue, setSearchValue] = useState('')
  useImperativeHandle(ref, () => ({
    // changeVal 就是暴露给父组件的方法
    getSelectedData: () => {
      return {
        targetKeysData: rightSelectedData,
        targetKeys,
      }
    }
  }));
  useEffect(() => {
    getInitData()
    getTableData({ params: "*" }, { pageNo: 1, pageSize: 10 });
    return () => { };
  }, [props]);

  //根据搜索获取列表
  const getTableData = async (
    params = {},
    pagination = { pageNo, pageSize }
  ) => {
    await getApiList({
      filters: {},
      ...pagination,
    }).then((res) => {
      const { state, data, total, pageNo, pageSize } = res.data;
      if (state) {
        setTableData(data.map((o, i) => ({ ...o, key: o.id })));
        setTotal(total);
        setPageNo(pageNo);
        setPageSize(pageSize);
      }
    });
  };

  const getInitData = () => {
    setRightData(initTargetData)
  }

  const TableTransfer = ({
    leftColumns,
    rightColumns,
    dataSource,
    ...restProps
  }) => (
    <Transfer {...restProps}>
      {({
        direction,
        onItemSelectAll,
        onItemSelect,
        selectedKeys: listSelectedKeys,
        disabled: listDisabled,
      }) => {
        const columns = direction === "left" ? leftColumns : rightColumns;
        const source = direction === "left" ? dataSource : rightData;
        const rowSelection = {
          onSelectAll(selected, selectedRows) {
            const treeSelectedKeys = selectedRows
              .filter((item) => !item.disabled)
              .map(({ key }) => key);
            const diffKeys = selected
              ? difference(treeSelectedKeys, listSelectedKeys)
              : difference(listSelectedKeys, treeSelectedKeys);
            onItemSelectAll(diffKeys, selected);
          },
          onSelect({ key }, selected) {
            onItemSelect(key, selected);
          },
        };
        if (direction === "right") {
          rowSelection['selectedRowKeys'] = targetKeys
          rowSelection["onChange"] = (keys, rows) => {
            setTargetKeys(keys)
            setRightSelectedData(rows)
          }

        }

        return (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={source}
            size="small"
            bordered
            style={{ pointerEvents: listDisabled ? "none" : null }}
            rowKey={record => record.id}
            pagination={
              direction === "left"
                ? {
                  current: pageNo,
                  total,
                  showTotal: (total, range) => `第${range[0]}-${range[1]} 条 / 共 ${total} 条`,
                  pageSize,
                  showQuickJumper: true,
                  showSizeChanger:true,
                  onChange: (page, size) => {
                    getTableData({
                      mapUrl: searchValue, configName: searchValue, creator: searchValue, tags: searchValue
                    },
                      {
                        pageNo: page, pageSize: size
                      })
                  },
                }
                : false
            }
            scroll={{
              y: 450
            }
            } /**/
          />
        );
      }}
    </Transfer>
  );

  /* 对选择重复的去重 */
  const duplicateRemoval = (data = []) => {
    const hash = {};
    const arr = data.reduce(function (result, cur) {
      if (!hash[cur.id]) {
        hash[cur.id] = true && result.push(cur)
      }
      return result
    }, [])
    return arr
  }

  const handleOnChange = (nextTargetKeys, direction, moveKeys) => {
    const NoRepeat = [...new Set(nextTargetKeys)]
    const data = [...rightData]
    tableData.forEach(item => {
      if (NoRepeat.find(otherItem => otherItem === item.id)) {
        data.push(item)
      }
    })
    setRightData(duplicateRemoval(data));
  };

  const handleSearch = (value) => {
    setSearchValue(value)
    getTableData(
      { mapUrl: value, configName: value, creator: value, tags: value },
      { pageNo: 1, pageSize: 10 }
    );
  };

  return (
    <>
      <Input.Search
        style={{ width: 654, marginBottom: 15 }}
        onSearch={handleSearch}
      ></Input.Search>
      <TableTransfer
        dataSource={tableData}
        oneWay
        bordered
        titles={['请选择加载的新增API', '请勾选要确认分享的API']}
        onChange={handleOnChange}
        showSelectAll={false}
        leftColumns={leftColumns}
        rightColumns={rightColumns}
      />
    </>
  );
};

export default forwardRef(NewTableTransfer);
