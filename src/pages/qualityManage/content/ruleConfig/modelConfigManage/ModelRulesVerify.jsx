import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Table, Button, Select, Tag, Switch, Input, Typography, InputNumber, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { qualityManageApi } from '@api/dataAccessApi';
import { getTreeSelectData } from '@tool/';

const Text = Typography.Text;

const { getQualityRuleList } = qualityManageApi.ruleConfig;

function FieldRules(props, ref) {
  const { data, applicationId } = props;

  const [curEditIndex, setCurEditIndex] = useState(-1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [fieldRules, setFieldRules] = useState([]);
  const [rulesList, setRulesList] = useState([]);

  useImperativeHandle(ref, () => ({
    getTableColumns,
  }));

  useEffect(() => {
    loadRuleList();
  }, []);

  useEffect(() => {
    data.length && setFieldRules(data.map((item, index) => {
      item.key = index
      return item
    }));
  }, [data]);

  const loadRuleList = () => {
    getQualityRuleList({categoryId: 'model'}).then(res => {
      const { state, data } = res.data;
      if (state) {
        const list = data.map(item => ({ label: item.value, value: item.key }));
        setRulesList(list);
      }
    });
  };

  const getTableColumns = () => {
    return fieldRules;
  };

  const renderConvertRuleIds = (index, key, text, record) => {
    if (index !== curEditIndex) {
      let name = '';
      if (text) {
        rulesList.some(item => {
          if (item.value === text) {
            name = item.label;
            return true;
          }
          return false;
        });
      }

      return <Tag color="blue">{name}</Tag>;
    }
    return (
      <Select
        size="small"
        allowClear
        showSearch
        value={text}
        options={rulesList}
        style={{ width: '100%' }}
        onChange={value => handleChange(key, index, value)}
        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
      />
    );
  };

  const renderHasInform = (index, key, text) => {
    if (index !== curEditIndex) {
      return <Tag color={text === 1 ? 'orange' : 'cyan'}>{text === 1 ? '不发送通知' : '结束后发送通知'}</Tag>;
    }
    let data = [
      { label: '不发送通知', value: 1 },
      { label: '结束后发送通知', value: 2 },
    ];
    return (
      <Select
        value={text}
        style={{ width: '100%' }}
        options={data}
        size="small"
        onChange={value => handleChange(key, index, value)}
      />
    );
  };

  const renderEditText = (index, key, text) => {
    text = text || '';
    if (index !== curEditIndex) {
      return text;
    }
    return (
      <Input
        style={{ width: '100%' }}
        value={text}
        size="small"
        onChange={e => handleChange(key, index, e.target.value)}
      />
    );
  };

  const renderInputNumber = (index, key, text) => {
    if (index !== curEditIndex) {
      return text;
    }
    return (
      <InputNumber
        min={0}
        max={100}
        size="small"
        style={{ width: '100%' }}
        defaultValue={text}
        onChange={value => handleChange(key, index, value)}
      />
    );
  };

  const handleChange = (key, index, value) => {
    const data = [...fieldRules];
    data[index][key] = value || '';
    setFieldRules(data);
  };

  const onRowClick = (record, index) => {
    setCurEditIndex(index);
  };

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys);
    };
    
    const onSwitch = (checked) => {
        const type = checked ? 2 : 1
        let data = [...fieldRules];
        data = data.map(item => {
            item.sendInform = type
            return item
        })
        setFieldRules(data)
  }
  
  const onCreate = () => {
    const key = fieldRules.length
    const newList = [...fieldRules, {key, qualityId: '', qualityParams: '', errorRatio: '', sendInform: 1 }];
    setFieldRules(newList)
  }

  const onDelete = index => {
    let newList = [...fieldRules];
    newList.splice(index, 1)
    newList.map((item, index) => {
      item.key = index
      return item
    })
    setFieldRules(newList);
  }

  const columns = [
    {
      title: '质量规则配置',
      dataIndex: 'qualityId',
      width: '50%',
      ellipsis: true,
      render: (text, record, index) => renderConvertRuleIds(index, 'qualityId', text),
    },
    {
      title: '质量规则参数',
      dataIndex: 'qualityParams',
      width: '30%',
      render: (text, record, index) => renderEditText(index, 'qualityParams', text),
    },
    {
      title: '错误占比',
      dataIndex: 'errorRatio',
      width: '8%',
      render: (text, record, index) => renderInputNumber(index, 'errorRatio', text),
    },
    {
      title: (
        <Space>
          是否发送通知
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
            onChange={onSwitch}
          />
        </Space>
      ),
      dataIndex: 'sendInform',
      width: '14%',
      render: (text, record, index) => renderHasInform(index, 'sendInform', text),
    },
    {
      title: '操作',
      key: 'action',
      width: '8%',
      render: (text, record, index) => (<Button type="link" onClick={() => onDelete(index)}>删除</Button>),
    },
  ];

  return (
    <div style={{ marginBottom: 30 }}>
      <Space direction="vertical">
        <Button type="primary" onClick={onCreate}>
          新增规则
        </Button>
        <Text strong>注意:错误占比达到预设值时可以设置API发送告警信息</Text>
      </Space>

      <Table
        bordered
        rowKey={record => record.key}
        dataSource={fieldRules}
        columns={columns}
        onRow={(record, index) => {
          return {
            onClick: () => onRowClick(record, index),
          };
        }}
        pagination={false}
        scroll={{ y: fieldRules.length > 15 ? 500 : undefined }}
        size="small"
      />
    </div>
  );
}

export default forwardRef(FieldRules);
