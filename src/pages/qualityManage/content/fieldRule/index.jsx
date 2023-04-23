import React, { useState, useEffect, useRef } from 'react';
import { Table, Card, Button, Modal, Input, Row, Col, Tag, Badge, Tabs, Space } from 'antd';
import { qualityManageApi } from '@api/dataAccessApi';
import DelButton from '@components/button';
import { showConfirm } from '@components/confirm';
import Icon from '@components/icon';
import { paginationConfig, showInfo } from '@tool/';
import { addIcon, editIcon, exportIcon, refreshIcon } from '@/constant/icon';
import NewProcessRule from './NewProcessRule';
import EditJavaCode from './editJavaCode/EditJavaCode';
import ListByRuleId from './ListByRuleId';

const Search = Input.Search;
const TabPane = Tabs.TabPane;

const { getList, deleteRule, saveRule, exporUrl } = qualityManageApi.qualityRule;

const applicationId = 'mdm';

export default function QualityRule(props) {
  const { appId } = props;
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [rowsData, setRowsData] = useState([]);
  const [panes, setPanes] = useState([]);
  const [tabActiveKey, setTabActiveKey] = useState('home');
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    loadData();
  }, [searchValue]);

  const loadData = (pagination = { current, pageSize }) => {
    const { current, pageSize } = pagination;
    const params = {
      pageNo: current,
      pageSize,
      applicationId,
      sort: 'editTime',
      order: 'DESC',
      categoryId: 'field'
      
    };
    searchValue && (params.searchFilters = {ruleName: searchValue, ruleId: searchValue})
    getList(params).then(res => {
      const { state, pageNo, pageSize, total, rows } = res.data;
      if (state) {
        setPageSize(pageSize);
        setCurrent(pageNo);
        setTotal(total);
        setRowsData(rows);
      }
    });
  };

  //Tab相关函数
  const onTabChange = tabActiveKey => {
    setTabActiveKey(tabActiveKey);
  };

  //点击X时关闭点击的Tab
  const tabRemove = targetKey => {
    let lastIndex;
    let key
    panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && tabActiveKey === targetKey) {
      key = panes[lastIndex].key;
    } else {
      key = 'home';
    }
    setPanes(newPanes);
    setTabActiveKey(key);
  };

  //Tab的各种触发事件
  const onTabEdit = (targetKey, action) => {
    if (action === 'remove') {
      tabRemove(targetKey);
    }
  };

  const addTabPane = (id, name, record) => {
    let tabActiveKey = record === undefined ? id : record.id;
    let content;
    if (id === 'New') {
      content = (
        <NewProcessRule
          type={id}
          id=""
          appId={appId}
          applicationId={applicationId}
          closeTab={reLoadFlag => closeCurrentTab(reLoadFlag, tabActiveKey)}
        />
      );
    } else if (id === 'Edit') {
      content = (
        <NewProcessRule
          type={id}
          id={record.id}
          record={record}
          applicationId={applicationId}
          closeTab={reLoadFlag => closeCurrentTab(reLoadFlag, tabActiveKey)}
        />
      );
    } else if (id === 'EditCode') {
      content = (
        <EditJavaCode
          code={record.ruleCode}
          record={record}
          beanId={record.classPath}
          templateType="ETLProcessRule"
        />
      );
    }
    const paneItem = { title: name, content: content, key: tabActiveKey };
    if (!containsTab(panes, paneItem)) {
      if (panes.length >= 5) {
        panes.splice(-1, 1, paneItem);
      } else {
        panes.push(paneItem);
      }
    }
    setPanes(panes);
    setTabActiveKey(tabActiveKey);
  };

  const onActionClick = (action, record, url) => {
    if (action === 'New') {
      addTabPane('New', '新增规则');
    } else if (action === 'Delete') {
      deleteData(record.id);
    } else if (action === 'Edit') {
      addTabPane('Edit', '修改:' + record.ruleName, record);
    } else if (action === 'EditCode') {
      addTabPane('EditCode', '修改:' + record.ruleName, record);
    } 
  };

  const deleteData = () => {
    const ids = selectedRowKeys.join(',');
    deleteRule({ ids }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        loadData();
      }
    });
  };

  //导出设计
  const exportConfig = () => {
    showConfirm('', '导出规则后可以使用导入功能重新导入!', () => {
      let ids = selectedRowKeys.join(',');
      let url = exporUrl + '?ids=' + ids;
      window.open(url);
    });
  };

  const refresh = e => {
    e && e.preventDefault();
    loadData({current: 1, pageSize});
  };

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
  };

  const onPageChange = (pagination, filters, sorter) => {
    loadData(pagination, filters, sorter);
  };

  //关闭当前活动的Tab并刷新Grid数据
  const closeCurrentTab = (reLoadFlag, key )=> {
    tabRemove(key || tabActiveKey);
    if (reLoadFlag !== false) {
      loadData();
    }
  };

  const containsTab = (arr, obj) => {
    var i = arr.length;
    while (i--) {
      if (arr[i].key === obj.key) {
        return true;
      }
    }
    return false;
  }

  const onSearch = e => {
    let value = e.target.value ? e.target.value.trim() : '';
    setSearchValue(value)
  }

  const columns = [
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      width: '30%',
      render: (text, record) => {
        return (
          <span>
            {text} <Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} />
          </span>
        );
      },
    },
    {
      title: '规则Id',
      dataIndex: 'ruleId',
      width: '15%',
    },
    {
      title: '应用Id',
      dataIndex: 'applicationId',
      width: '10%',
    },
    {
      title: '创建者',
      dataIndex: 'editorName',
      width: '8%',
    },
    {
      title: '修改时间',
      dataIndex: 'editTime',
      width: '13%',
    },
    {
      title: '公开',
      dataIndex: 'publicType',
      width: '8%',
      render: (text, record) => {
        if (text === 1) {
          return <Tag color="green">公开</Tag>;
        } else {
          return <Tag>私有</Tag>;
        }
      },
    },
    {
      title: '代码',
      dataIndex: 'code',
      width: '8%',
      render: (text, record) => {
        return (
          <a onClick={() => onActionClick('EditCode', record)}>
            <Icon type={editIcon} />
            代码
          </a>
        );
      }
    },
    {
      title: '操作',
      dataIndex: '',
      key: 'x',
      width: '8%',
      render: (text, record) => {
          return (
            <span>
              <a onClick={() => onActionClick('Edit', record)}>修改</a>
            </span>
          );
      },
    },
  ];

  const expandedRow = record => {
    return (
      <Card title="引用本规则的系统列表">
        <ListByRuleId id={record.id} />
      </Card>
    );
  };

  return (
    <div className="wrapper-content">
      <Tabs
        onChange={onTabChange}
        onEdit={onTabEdit}
        type="editable-card"
        activeKey={tabActiveKey}
        animated={false}
        hideAdd={true}
      >
        <TabPane tab="规则列表" key="home">
          <Row justify="space-between">
            <Col>
              <Space>
                <Button type="primary" onClick={() => onActionClick('New')}>
                  <Icon type={addIcon} />
                  新增规则
                </Button>
                <DelButton onClick={deleteData} disabled={selectedRowKeys.length < 1} />
                {/* <Button type="ghost" onClick={this.onActionClick.bind(this, 'category')} icon="file">
                  分类管理
                </Button> */}
                <Button type="ghost" onClick={exportConfig} disabled={selectedRowKeys.length < 1}>
                  <Icon type={exportIcon} />
                  导出
                </Button>
                <Button type="ghost" onClick={refresh}>
                  <Icon type={refreshIcon} />
                  刷新
                </Button>
              </Space>
            </Col>
            <Col>
              <Search
                allowClear
                placeholder="配置Id|说明"
                style={{ width: 260 }}
                onChange={value => onSearch(value)}
              />
            </Col>
          </Row>
          <div className="table-content">
            <Table
              rowKey={record => record.id}
              dataSource={rowsData}
              columns={columns}
              rowSelection={{ selectedRowKeys, onChange: onSelectChange }}
              onChange={onPageChange}
              pagination={paginationConfig(current, total, pageSize)}
              expandedRowRender={expandedRow}
            />
          </div>
        </TabPane>
        {panes.map(pane => (
          <TabPane tab={pane.title} key={pane.key}>
            {pane.content}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
}
