import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Table, Checkbox, Row, Col, Input, Space, Button, Select } from 'antd';
import { standardManage } from '@api/dataAccessApi';
import { refreshIcon } from '@/constant/icon.js';
import { isArray, isObject } from 'lodash';
import { SaveOutlined } from '@ant-design/icons';
import { showInfo } from '@tool/';
import Icon from '@components/icon';
import update from 'immutability-helper';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const type = 'DraggableBodyRow';

const { getFormField, saveDetailField, getFormFieldType, getFormFieldFormat } =
  standardManage.informationManageApi;

const { Search } = Input;

const DraggableBodyRow = ({ index, moveRow, className, style, ...restProps }) => {
  const ref = useRef(null);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: monitor => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: item => {
      moveRow(item.index, index);
    },
  });
  const [, drag] = useDrag({
    type,
    item: {
      index,
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));
  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{
        cursor: 'move',
        ...style,
      }}
      {...restProps}
    />
  );
};


export default function FormInfoPage(props) {
  const { dataModelId } = props;

  const [dataSource, setDataSource] = useState([]);
  const [typeOptions, setTypeOptions] = useState([])
  const [formatOptions, setFormatOptions] = useState([])

  const allData = useRef([]);


  const columns = [
    {
      title: '字段名称',
      key: 'fieldName',
      dataIndex: 'fieldName',
      width: '18%',
      ellipsis: true,
    },
    {
      title: '字段注释',
      key: 'fieldComment',
      dataIndex: 'fieldComment',
      width: '18%',
      ellipsis: true,
    },
    {
      title: '展示字段',
      key: 'showForm',
      dataIndex: 'showForm',
      width: '6%',
      ellipsis: true,
      render: (text, record, index) => renderCheckBox(index, 'showForm', text),
    },
    {
      title: '搜索字段',
      key: 'queryForm',
      dataIndex: 'queryForm',
      width: '6%',
      ellipsis: true,
      render: (text, record, index) => renderCheckBox(index, 'queryForm', text),
    },
    {
      title: '高级搜索字段',
      key: 'advancedQueryForm',
      dataIndex: 'advancedQueryForm',
      width: '6%',
      ellipsis: true,
      render: (text, record, index) => renderCheckBox(index, 'advancedQueryForm', text),
    },
    {
      title: '新增字段',
      key: 'addForm',
      dataIndex: 'addForm',
      width: '6%',
      ellipsis: true,
      render: (text, record, index) => renderCheckBox(index, 'addForm', text),
    },
    {
      title: '编辑字段',
      key: 'editForm',
      dataIndex: 'editForm',
      width: '6%',
      ellipsis: true,
      render: (text, record, index) => renderCheckBox(index, 'editForm', text),
    },
    {
      title: '字段类型',
      dataIndex: 'editFieldType',
      width: '12%',
      render: (text, record, index) => renderSelect(index, 'editFieldType', text, typeOptions),
    },
    {
      title: '渲染格式',
      dataIndex: 'editFieldFormat',
      width: '12%',
      render: (text, record, index) =>
        renderSelect(index, 'editFieldFormat', text, formatOptions, record.editFieldType !== 'oneText'),
    },
  ];
  
  useEffect(() => {
    loadSelectOptions()
  }, [])

  useEffect(() => {
    loadFormField();
  }, [dataModelId]);

  const loadSelectOptions = () => {
    getFormFieldType().then(res => {
      const { state, data } = res.data
      if (state && isObject(data)) {
        let options = []
        for (let key in data) {
          options.push({
            value: key,
            label: data[key]
          })
        }
        setTypeOptions(options)
      }
    })
    getFormFieldFormat().then(res => {
      const { state, data } = res.data;
      if (state && isObject(data)) {
        let options = [];
        for (let key in data) {
          options.push({
            value: key,
            label: data[key],
          });
        }
        setFormatOptions(options);
      }
    });
  }

  const loadFormField = () => {
    getFormField({ dataModelId }).then(res => {
      const { state, data } = res.data;
      if (state && isArray(data)) {
        allData.current = data;
        setDataSource(data);
      }
    });
  };

  const handleChange = (key, index, value) => {
    let data = [...dataSource];
    if (key === 'editFieldType' && value !== 'oneText') {
      data[index].editFieldFormat = 'string'
    }
    data[index][key] = value;
    setDataSource(data);
  };

  const renderCheckBox = (index, key, text) => {
    return <Checkbox checked={text} onChange={e => handleChange(key, index, e.target.checked)} />;
  };

  const handleSaveFields = () => {
    const fieldData = JSON.stringify(dataSource);
    saveDetailField({ fieldData }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo('保存成功');
      }
    });
  };

  const refresh = () => {
    loadFormField();
  };

  const onSearch = value => {
    let list = [];
    if (!value) {
      list = allData.current;
    } else {
      value = value.trim().toLowerCase();
      list = allData.current.filter(
        item => item.fieldName.toLowerCase() === value || item.fieldComment.toLowerCase() === value
      );
    }
    setDataSource(list);
  };

  const renderSelect = (index, key, text, options, disabled = false) => {
    return (
      <Select
        disabled={disabled}
        value={text}
        style={{ width: '100%' }}
        options={options}
        onChange={value => handleChange(key, index, value)}
      />
    );
  };

  const components = {
    body: {
      row: DraggableBodyRow,
    },
  };

  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      const dragRow = dataSource[dragIndex];
      const data = update(dataSource, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragRow],
        ],
      });
      setDataSource(data);
    },
    [dataSource]
  );

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 5 }}>
        <Col>
          <Space>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveFields}>
              保存
            </Button>
            <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
              刷新
            </Button>
          </Space>
        </Col>
        <Col span={7} style={{ textAlign: 'right' }}>
          <Search placeholder="字段注释/字段名称" style={{ width: 250 }} onSearch={onSearch} allowClear />
        </Col>
      </Row>
      <DndProvider backend={HTML5Backend}>
        <Table
          dataSource={dataSource}
          bordered
          size="middle"
          columns={columns}
          rowKey={row => row.id}
          scroll={{ x: 'max-content' }}
          components={components}
          pagination={false}
          onRow={(_, index) => {
            const attr = {
              index,
              moveRow,
            };
            return attr;
          }}
        />
      </DndProvider>
    </div>
  );
}
