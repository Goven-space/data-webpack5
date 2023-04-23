import React, { useEffect, useState, useRef, useContext } from 'react';
import { Modal, Row, Col, Tree, Form, Button, Input } from 'antd';
import { FolderOpenOutlined, FileAddOutlined } from '@ant-design/icons';
import { isArray } from 'lodash';
import InformationManagePage from './InformationManagePage';
import FieldDataPage from './fieldDataPage/FieldDataPage';
import CMForm from '@/components/cmForm';
import MainContext from '@store';
import { searchTreeData } from '@tool';
import { standardManage } from '@api/dataAccessApi';
import TextToolTip from '@components/textToolTip';
import ClassifyManagePage from './ClassifyManagePage';

const { getIdOpt } = standardManage.classifyManagePageApi;
const { getInfoClassifyOpt } = standardManage.publice;
const { addClassifyList } = standardManage.informationManageApi;

const { Search } = Input;

const Index = ({ menuKey }) => {
  const [menuKeyId, setMenuKeyId] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [expandKey, setExpandKey] = useState([]);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('新增分类');
  const [currentItem, setCurrentItem] = useState({ type: 'information' });
  const [menuParentId, setMenuParentId] = useState('');

  const [form] = Form.useForm();
  const formItemWidth = 300;
  const labelCol = { span: 6 };
  const creator = sessionStorage.getItem('userId');
  const pageRef = useRef(null);
  const classifyRef = useRef(null);

  const { setMasterClassify } = useContext(MainContext);
  useEffect(() => {
    getInitData(true);
  }, []);

  const getInitData = (init = false, refreshMenu = false) => {
    //获取侧边栏数据
    getInfoClassifyOpt().then(res => {
      const { state, data } = res.data;
      if (state) {
        refreshMenu && isArray(data) && setMasterClassify(data);
        const newData = data.map((item, index) => {
          return getFormatData(item, item.id);
        });
        setTreeData([
          {
            title: (
              <div className="info-menu">
                <TextToolTip text="分类管理">
                  <div className="menu-text">分类管理</div>
                </TextToolTip>
              </div>
            ),
            key: 'information',
            type: 'information',
            name: `分类管理`,
            icon: props => {
              <FolderOpenOutlined />;
            },
          },
          ...newData,
        ]);
        if (init) {
          setMenuKeyId(['information']);
          setExpandKey(['information']);
        }
      }
    });
  };

  const dealChild = (arr = [], parentId) => {
    return arr.map(item => {
      return getFormatData(item, parentId);
    });
  };

  const getFormatData = (item, parentId) => {
    return {
      title: (
        <div className="info-menu">
          <TextToolTip text={item.modelName}>
            <div className="menu-text">{item.modelName}</div>
          </TextToolTip>
          {/* {item.leaf ? null : (
            <div className="menu-btn">
              <Button type="link" icon={<FileAddOutlined />} onClick={e => handleAddFile(e, item, parentId)}></Button>
            </div>
          )} */}
        </div>
      ),
      parentId: parentId,
      name: item.modelName,
      num: item.num,
      key: item.id,
      gatherFlowIds: item.gatherFlowIds || '',
      gatherFlowApplyId: item.gatherFlowApplyId || '',
      distributeFlowIds: item.distributeFlowIds || '',
      distributeFlowApplyId: item.distributeFlowApplyId || '',
      isLeaf: item.leaf,
      classifyType: item.classifyType,
      nodeMark: item.nodeMark,
      type: item.type,
      icon: item.leaf ? <FolderOpenOutlined /> : <FolderOpenOutlined />,
      children: item.children && item.children.length ? dealChild(item.children, parentId) : undefined,
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

  const submitForm = values => {
    !values.theirTopClassifyId && (values.theirTopClassifyId = values.id);
    addClassifyList({
      ...values,
      classifyType: 'normInformation',
      creator,
      type: 'classify',
    }).then(res => {
      if (res.data.state) {
        getInitData();
        handleCancel();
        if (pageRef.current) {
          pageRef.current.getTableData();
        }
        if (classifyRef.current) {
          classifyRef.current.getTableData();
        }
      }
    });
  };

  const cmFormConfig = {
    formOpts: {
      form,
      onFinish: submitForm,
      initialValues: {
        node: 'root',
        nodeMark: 'root',
      },
    },
    data: [
      {
        opts: {
          name: 'theirTopClassifyId',
          label: '父级Id',
          labelCol,
          hidden: true,
        },
        input: {
          style: {
            width: formItemWidth,
          },
        },
      },
      {
        opts: {
          name: 'id',
          label: '分类ID',
          required: true,
          labelCol,
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
          labelCol,
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
          name: 'modelName',
          label: '分类名称',
          required: true,
          labelCol,
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
          labelCol,
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

  const handleAddFile = (e, item = {}, parentId) => {
    e.stopPropagation();
    getId();
    form.setFieldsValue({
      nodeMark: item.modelName || 'root',
      node: item.id || 'root',
      theirTopClassifyId: parentId || '',
    });
    setVisible(true);
  };

  const handleTreeSelect = (selectedKeys, { selected, selectedNodes, node, event }) => {
    if (selected) {
      setMenuParentId(node.parentId);
      setMenuKeyId(selectedKeys);
      setCurrentItem({ ...node });
    }
  };

  const handleExpand = (expandedKeys, { expanded: bool, node }) => {
    setExpandKey(expandedKeys);
  };

  const onSearch = value => {
    if (!value) {
      getInitData(true);
    }
    const newData = searchTreeData(treeData, value);
    setTreeData(newData);
  };

  return (
    <div className="manage-content">
      <Modal visible={visible} footer={null} onCancel={handleCancel} width={550} destroyOnClose={false} title={title}>
        <CMForm {...cmFormConfig} />
      </Modal>
      <Row gutter={16} justify="start" wrap={false}>
        <Col flex="220px" className="content-menu info-content">
          <div className="content-menu-search">
            <Search placeholder="请输入分类名称 / 模型名称" onSearch={onSearch} size="small" allowClear />
          </div>
          <Tree rootClassName="tree-classify-content" showLine treeData={treeData} onSelect={handleTreeSelect} selectedKeys={menuKeyId} expandedKeys={expandKey} onExpand={handleExpand} />
        </Col>
        <Col flex="8px" className="cutting-line" />
        <Col flex="auto" className="content-table">
          {currentItem.type === 'classify' ? (
            <InformationManagePage menuKeyId={menuKeyId[0]} menuParentId={menuParentId} currentItem={currentItem} getInitData={getInitData} ref={pageRef} />
          ) : currentItem.type === 'information' ? (
            <ClassifyManagePage menuKeyId={menuKeyId[0]} currentItem={currentItem} getInitData={getInitData} ref={classifyRef} />
          ) : (
            <FieldDataPage menuKeyId={menuKeyId[0]} pid={menuKeyId[0]} getInitData={getInitData} classifyName={currentItem.name} targetData={currentItem} />
          )}
        </Col>
      </Row>
    </div>
  );
};
export default Index;
