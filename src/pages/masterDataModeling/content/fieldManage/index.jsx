import React, { useEffect, useState, useRef } from 'react';
import { Modal, Row, Col, Tree, Form, Input, Button } from 'antd';
import { FolderOpenOutlined, PlusCircleOutlined, FileAddTwoTone } from '@ant-design/icons';
import {searchTreeData} from '@tool/'
import MetadataManagePage from './MetadataManagePage';
import CodeSetManagePage from '../codeSetManage/CodeSetManagePage';
import ClassifyManagePage from '../classifyManage/ClassifyManagePage';
import CMForm from '@/components/cmForm';
import { standardManage } from '@api/dataAccessApi';
import TextToolTip from '@components/textToolTip';

const { addList, getIdOpt } = standardManage.classifyManagePageApi;
const { getClassifyOpt } = standardManage.publice;

const { Search } = Input;

const Index = ({ menuKey }) => {
  const [treeKeyId, setTreeKeyId] = useState([]);
  const [expandKey, setExpandKey] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('新增分类');
  const [isLeaf, setIsLeaf] = useState(false);
  const [rootKey, setRootKey] = useState('');
  const [targetItem, setTargetItem] = useState({});

  const [form] = Form.useForm();
  const formItemWidth = 300;
  const labelCol = { span: 6 };
  const creator = sessionStorage.getItem('userId');

  useEffect(() => {
    if (menuKey) {
      getInitData(true);
    } 
  }, [menuKey]);


  const getInitData = (init = false) => {
    const key = menuKey === 'fieldManage' ? 'normDataElement' : menuKey;
    setRootKey(key)
    //获取侧边栏数据
    getClassifyOpt({
      classifyType: key,
    }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const newData = data.map((item, index) => {
          return getFormatData(item);
        });
        if (init) {
          setTreeKeyId([key]);
          setExpandKey([key]);
        }
        setTreeData([
          {
            title: (
              <div className="info-menu">
                <TextToolTip text={`${menuKey === 'fieldManage' ? '字段' : '代码集'}分类管理`}>
                  <div className="menu-text">{`${
                    menuKey === 'fieldManage' ? '字段' : '代码集'
                  }分类管理`}</div>
                </TextToolTip>
              </div>
            ),
            isLeaf: false,
            key,
            name: `${menuKey === 'fieldManage' ? '字段' : '代码集'}分类管理`,
            children: [...newData],
          },
        ]);
      }
    });
  };

  const dealChild = (arr = [], dataSourceId) => {
    return arr.map(item => {
      return getFormatData(item, dataSourceId);
    });
  };

  const getFormatData = (item, dataSourceId = '') => {
    dataSourceId = dataSourceId || item.dataSourceId;
    return {
      title: (
        <div className="info-menu">
          <TextToolTip text={item.classifyName}>
            <div className="menu-text">{item.classifyName}</div>
          </TextToolTip>
        </div>
      ),
      name: item.classifyName,
      key: item.id,
      isLeaf: item.isLeaf,
      type: item.type,
      dataSourceId,
      icon: item.isLeaf ? <FolderOpenOutlined /> : <FolderOpenOutlined />,
      children: item.children && item.children.length ? dealChild(item.children, dataSourceId) : undefined,
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
    addList({ ...value, classifyType: rootKey, creator }).then(res => {
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

  const handleTreeSelect = (selectedKeys, { selected, selectedNodes, node, event }) => {
    if (selected) {
      setIsLeaf(node.isLeaf);
      setTreeKeyId(selectedKeys);
      setTargetItem({ nodeMark: node.name, dataSourceId: node.dataSourceId, key: node.key });
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
            <Search placeholder="请输入" onSearch={onSearch} size="small" allowClear />
          </div>
          <Tree
            className="tree-classify-content"
            showLine={true}
            treeData={treeData}
            onSelect={handleTreeSelect}
            selectedKeys={treeKeyId}
            icon={<FolderOpenOutlined />}
            expandedKeys={expandKey}
            onExpand={handleExpand}
          />
        </Col>
        <Col flex="8px" className="cutting-line" />
        <Col flex="auto" className="content-table">
          {treeKeyId[0] === 'normDataElement' || treeKeyId[0] === 'normCode' || !isLeaf ? (
            <ClassifyManagePage
              menuKeyId={treeKeyId[0]}
              getMenuData={getInitData}
              rootKey={rootKey}
              targetItem={targetItem}
            />
          ) : menuKey === 'normCode' && treeKeyId[0] !== 'normCode' ? (
            <CodeSetManagePage menuKeyId={treeKeyId[0]} getMenuData={getInitData} />
          ) : (
            <MetadataManagePage menuKeyId={treeKeyId[0]} getMenuData={getInitData} targetItem={targetItem} />
          )}
        </Col>
      </Row>
    </div>
  );
};
export default Index;
