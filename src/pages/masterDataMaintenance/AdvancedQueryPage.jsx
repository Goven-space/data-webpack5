import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Input, Space, Select, Button, Table, Dropdown, Menu } from 'antd';
import { addIcon, resetIcon, searchIcon } from '@/constant/icon.js';
import { isObject, isArray } from 'lodash';
import { kernelModule } from '@api/dataAccessApi';
import { showInfo, showError } from '@tool/';
import { SaveOutlined } from '@ant-design/icons';
import Icon from '@components/icon';
import EditText from '@components/editText';

const { getparams, saveQueryConfig, getQueryConfig, deleteQueryConfig } =
  kernelModule.advancedQueryApi;

export default function AdvancedQueryPage(props) {
  const { formAdvancedQuery, dataModelId, closeModal, loadList } = props;

  const [filterFieldList, setFilterFieldList] = useState([]);
  const [judgmentList, setJudgmentList] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [configList, setConfigList] = useState([]);
  const [queryConfig, setQueryConfig] = useState({ queryName: '', matching: 'and' });

  const matchingList = [
    {
      value: 'and ',
      label: 'and ',
    },
    {
      value: 'or',
      label: 'or',
    },
  ];

  const saveItems = (
    <Menu>
      <Menu.Item key="save" onClick={() => handleSave()}>
        保存
      </Menu.Item>
      <Menu.Item key="saveAs" onClick={() => handleSave(true)}>
        另存为
      </Menu.Item>
    </Menu>
  );

  const align = 'center';

  useEffect(() => {
    loadparams();
    loadQueryConfig();
  }, []);

  useEffect(() => {
    if (formAdvancedQuery.length) {
      const list = formAdvancedQuery.map(item => ({
        value: item.fieldName,
        label: `${item.fieldName} [${item.fieldComment}]`,
      }));
      setFilterFieldList(list);
    }
  }, [formAdvancedQuery]);

  useEffect(() => {}, [queryConfig]);

  const loadparams = () => {
    getparams().then(res => {
      const { state, data } = res.data;
      if (state && isObject(data)) {
        let list = [];
        for (let key in data) {
          list.push({
            value: key,
            label: data[key],
          });
        }
        setJudgmentList(list);
      }
    });
  };

  const loadQueryConfig = () => {
    getQueryConfig({ dataModelId }).then(res => {
      const { state, data } = res.data;
      if (state && isArray(data)) {
        setConfigList(data);
      }
    });
  };

  const onQueryNameChange = e => {
    const config = { ...queryConfig };
    config.queryName = e.target.value;
    setQueryConfig(config);
  };

  const onMatchingChange = value => {
    const config = { ...queryConfig };
    config.matching = value;
    setQueryConfig(config);
  };

  const queryConditionColumns = [
    {
      title: '过滤字段',
      key: 'fieldName',
      dataIndex: 'fieldName',
      width: '30%',
      align,
      render: (text, record, index) => renderFilterSelect(index, 'fieldName', text),
    },
    {
      title: '比较类型',
      key: 'judgment',
      dataIndex: 'judgment',
      width: '25%',
      align,
      render: (text, record, index) => renderJudgeSelect(index, 'judgment', text),
    },
    {
      title: '输入值',
      key: 'value',
      dataIndex: 'value',
      width: '30%',
      align,
      render: (text, record, index) => renderEditText(index, 'value', text),
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      align,
      render: (text, record, index) => (
        <Button type="link" onClick={() => handleDelete(index)}>
          删除
        </Button>
      ),
    },
  ];

  const configListColumns = [
    {
      title: '保存的查询',
      key: 'queryName',
      dataIndex: 'queryName',
      render: (text, record) => (
        <Row justify="space-between">
          <Col>
            <Button type="link" onClick={() => handleSelected(record)}>
              {text}
            </Button>
          </Col>
          <Col>
            <Button type="link" onClick={() => handleDeleteConfig(record)}>
              X
            </Button>
          </Col>
        </Row>
      ),
    },
  ];

  const renderEditText = (index, key, text) => {
    return (
      <EditText
        value={text}
        style={{ width: '100%' }}
        size="small"
        onChange={value => handleChange(key, index, value)}
      />
    );
  };

  const renderFilterSelect = (index, key, text) => {
    return (
      <Select
        value={text}
        style={{ width: '100%' }}
        options={filterFieldList}
        onChange={value => handleChange(key, index, value)}
      />
    );
  };

  const renderJudgeSelect = (index, key, text) => {
    return (
      <Select
        value={text}
        style={{ width: '100%' }}
        options={judgmentList}
        onChange={value => handleChange(key, index, value)}
      />
    );
  };

  const handleChange = (key, index, value) => {
    let data = [...dataSource];
    data[index][key] = value;
    setDataSource(data);
  };

  const handleDelete = index => {
    let data = [...dataSource];
    data.splice(index, 1);
    setDataSource(data);
  };

  const handleAddCondition = () => {
    let data = [...dataSource];
    data.push({ fieldName: filterFieldList[0].value, judgment: judgmentList[0].value, value: '' });
    setDataSource(data);
  };

  const handleSave = (flag) => {
    if (!queryConfig.queryName) {
      showError('未填写名称！')
      return
    }
    let postData = {};
    postData.modelQueryConditionList = JSON.stringify(dataSource);
    postData.dataModelId = dataModelId;
    const config = {...queryConfig}
    if (flag) {
      delete config.id
    }
    postData = Object.assign({}, config, postData);
    saveQueryConfig({
      ...postData,
    }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        loadQueryConfig();
      }
    });
  };

  const handleSelected = record => {
    setQueryConfig(record);
    const data = record.modelQueryConditionList || [];
    setDataSource(data);
  };

  const handleDeleteConfig = record => {
    deleteQueryConfig({ ids: record.id }).then(res => {
      const { state } = res.data;
      if (state) showInfo('删除成功');
      loadQueryConfig();
    });
  };

  const reset = () => {
    setQueryConfig({ queryName: '', matching: 'and' });
    setDataSource([])
  }

  const onSearch = () => {
    closeModal()
    const advancedQuery = queryConfig.id || {
      modelQueryConditionList: JSON.stringify(dataSource),
      matching: queryConfig.matching
    }
    loadList({ current: 1, pageSize: 10 }, advancedQuery);
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space>
        查询名称:
        <Input style={{ width: 300 }} value={queryConfig.queryName} onChange={onQueryNameChange} />
      </Space>
      <Space>
        条件关系:
        <Select
          style={{ width: 200 }}
          value={queryConfig.matching}
          onChange={onMatchingChange}
          options={matchingList}
        />
        <Button type="primary" icon={<Icon type={addIcon} />} onClick={handleAddCondition}>
          新增条件
        </Button>
      </Space>
      <Row gutter={30} justify="space-between">
        <Col span="18">
          <Table
            size="small"
            bordered
            columns={queryConditionColumns}
            dataSource={dataSource}
            scroll={{ y: dataSource.length > 8 ? 400 : undefined }}
            pagination={false}
          />
        </Col>
        <Col span="6">
          <Table
            size="small"
            bordered
            columns={configListColumns}
            dataSource={configList}
            scroll={{ y: configList.length > 8 ? 400 : undefined }}
            pagination={false}
          />
        </Col>
      </Row>
      <Row justify="space-between">
        <Col>
          <Space>
            <Button onClick={reset} icon={<Icon type={resetIcon} />}>
              重置
            </Button>
            <Dropdown overlay={saveItems}>
              <Button icon={<SaveOutlined />}>保存</Button>
            </Dropdown>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button onClick={() => closeModal()}>取消</Button>
            <Button type="primary" icon={<Icon type={searchIcon} />} onClick={() => onSearch()}>
              查询
            </Button>
          </Space>
        </Col>
      </Row>
    </Space>
  );
}
