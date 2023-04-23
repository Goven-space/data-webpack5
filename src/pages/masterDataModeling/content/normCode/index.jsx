import React, { useEffect, useState, useRef } from 'react';
import { Modal, Row, Col, Tree, Form, Input, Menu } from 'antd';
import { FolderOpenOutlined, PlusCircleOutlined } from '@ant-design/icons';
import FieldDataPage from './FieldDataPage';
import CodeSetManagePage from './CodeSetManagePage';
import ClassifyManagePage from '../classifyManage/ClassifyManagePage';
import { searchTreeData } from '@tool/index.js';
import { standardManage } from '@api/dataAccessApi';
import TextToolTip from '@components/textToolTip';
import CMForm from '@/components/cmForm';
import '../css/index.less'

const { addList, getIdOpt } = standardManage.classifyManagePageApi;
const { listStructureTree } = standardManage.codeSetManageApi;

const { Search } = Input;

const Index = ({ menuKey, location }) => {
  const [treeKeyId, setTreeKeyId] = useState([menuKey]);
  const [expandKey, setExpandKey] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('新增分类');
  const [currentNode, setCurrentNode] = useState({
    isLeaf: false,
    type: 'classify',
    nodeMark: 'root',
    node: 'root',
  });

  const [form] = Form.useForm();
  const formItemWidth = 300;
  const labelCol = { span: 6 };
  const creator = sessionStorage.getItem('userId');

  useEffect(() => {
    getInitData(true);
  }, [menuKey]);

  const getInitData = (init = false) => {
    //获取侧边栏数据
    listStructureTree({ classifyType: menuKey }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const newData = data.map((item, index) => {
          return getFormatData(item);
        });
        if (init) {
          setTreeKeyId([menuKey]);
          setExpandKey([menuKey]);
        }
        setTreeData([
          {
            title: (
              <div className="info-menu">
                <TextToolTip text="分类管理">
                  <div className="menu-text">分类管理</div>
                </TextToolTip>
              </div>
            ),
            isLeaf: true,
            key: menuKey,
            type: 'classify',
            name: 'root',
            icon: props => {
              <FolderOpenOutlined />;
            },
          },
          ...newData,
        ]);
      }
    });
  };

  const dealChild = (arr = []) => {
    return arr.map(item => {
      return getFormatData(item);
    });
  };

  const getFormatData = item => {
    return {
      title: (
        <div className="info-menu">
          <TextToolTip text={item.name}>
            <div className="menu-text">{item.name}</div>
          </TextToolTip>
        </div>
      ),
      name: item.name,
      key: item.id,
      isLeaf: item.isLeaf,
      type: item.type,
      children: item.children && item.children.length ? dealChild(item.children) : undefined,
    };
  };

  const getId = () => {
    //获取字段初始ID
    getIdOpt({
      appId: 'ASSET',
      type: 'CATEGORY',
    }).then(res => {
      for (const key in res.data) {
        form.setFieldsValue({
          id: res.data[key],
        });
      }
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const submitForm = value => {
    addList({ ...value, classifyType: menuKey, creator }).then(res => {
      if (res.data.state) {
        getInitData();
        handleCancel();
      }
    });
  };

  const cmFormConfig = {
    formOpts: {
      form,
      onFinish: submitForm,
      labelCol,
      initialValues: {
        node: 'root',
        nodeMark: 'root',
      },
    },
    data: [
      {
        opts: {
          name: 'id',
          label: '分类ID',
          required: true,
        },
        input: {
          style: {
            width: formItemWidth,
          },
        },
      },
      {
        opts: {
          name: 'node',
          label: '上级分类',
          required: true,
          hidden: true,
        },
        input: {
          style: {
            width: formItemWidth,
          },
          disabled: true,
        },
      },
      {
        opts: {
          name: 'nodeMark',
          label: '上级分类',
          required: true,
          labelCol,
        },
        input: {
          style: {
            width: formItemWidth,
          },
          disabled: true,
        },
      },
      {
        opts: {
          name: 'classifyName',
          label: '分类名称',
          required: true,
        },
        input: {
          style: {
            width: formItemWidth,
          },
        },
      },
      {
        opts: {
          name: 'sort',
          label: '排序',
          required: true,
          initialValue: 10000,
        },
        number: {
          style: {
            width: formItemWidth,
          },
          min: 0,
        },
      },

      {
        opts: {
          className: 'page-form-footer',
        },
        button: [
          {
            opts: {
              type: 'primary',
              htmlType: 'submit',
            },
            title: '确认',
          },
          {
            opts: {
              onClick: handleCancel,
            },
            title: '取消',
          },
        ],
      },
    ],
  };

  const handleAddFile = (e, item = {}) => {
    e.stopPropagation();
    getId();
    form.setFieldsValue({
      nodeMark: item.classifyName || 'root',
      node: item.id || 'root',
    });
    setVisible(true);
  };

  const handleTreeSelect = (selectedKeys, { selected, selectedNodes, node, event }) => {
    if (selected) {
      setTreeKeyId(selectedKeys);
      setCurrentNode({
        isLeaf: selectedNodes[0].isLeaf,
        type: selectedNodes[0].type,
        nodeMark: selectedNodes[0].name,
        node: selectedNodes[0].key,
      });
    }
  };

  const onSearch = value => {
    if (!value) {
      getInitData();
    }
    const newData = searchTreeData(treeData, value);
    setTreeData(newData || []);
  };

  const handleExpand = (expandedKeys, { expanded: bool, node }) => {
    setExpandKey(expandedKeys);
  };

  return (
    <div className="manage-content">
      <Modal
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={550}
        destroyOnClose={false}
        title={title}
      >
        <CMForm {...cmFormConfig} />
      </Modal>
      <Row gutter={16} justify="start" wrap={false}>
        <Col flex="220px" className="content-menu info-content">
          <div className="content-menu-search">
            <Search placeholder="请输入分类名称 / 代码名称" onSearch={onSearch} size="small" />
          </div>
          <Tree
            className="tree-classify-content"
            showLine
            treeData={treeData}
            onSelect={handleTreeSelect}
            selectedKeys={treeKeyId}
            expandedKeys={expandKey}
            onExpand={handleExpand}
          />
        </Col>
        <Col flex="8px" className="cutting-line" />
        <Col flex="auto" className="content-table">
          {currentNode.type === 'classify' ? (
            <ClassifyManagePage
              menuKeyId={treeKeyId[0]}
              getMenuData={getInitData}
              rootKey={menuKey}
              currentNode={currentNode}
            />
          ) : currentNode.isLeaf ? (
            <FieldDataPage id={treeKeyId[0]} getMenuData={getInitData} />
          ) : currentNode.type === 'dataModel' ? (
            <CodeSetManagePage
              menuKeyId={treeKeyId[0]}
              getMenuData={getInitData}
              getInitTreeData={getInitData}
            />
          ) : null}
        </Col>
      </Row>
    </div>
  );
};
export default Index;
