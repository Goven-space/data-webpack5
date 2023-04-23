import React, { useEffect, useState, useRef } from 'react';
import { Modal, Menu, Tree, Form, Button, Input, Row, Col } from 'antd';
import MetadataLabelPage from './MetadataLabelPage';
import ClassifyManagePage from '../classifyManage/ClassifyManagePage';
import { standardManage, metadataManage } from '@api/dataAccessApi';
import { getMenu } from '@tool';
import CMForm from '@/components/cmForm';
import TextToolTip from '@components/textToolTip';

const { getIdOpt } = standardManage.classifyManagePageApi;
const { getClassifyOpt } = standardManage.publice;
const { addClassify } = metadataManage.publice;

const Index = ({ menuKey }) => {
  const [menuKeyId, setMenuKeyId] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [openKey, setOpenKey] = useState([]);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('新增分类');

  const [form] = Form.useForm();
  const formItemWidth = 300;
  const labelCol = { span: 6 };
  const creator = sessionStorage.getItem('userId');
  const pageRef = useRef(null);
  const classifyRef = useRef(null);

  useEffect(() => {
    getInitData(true);
  }, []);

  const getInitData = (init = false) => {
    //获取侧边栏数据
    getClassifyOpt({ classifyType: menuKey }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const newItems = getMenu(data, 'classifyName', 'id');
        if (init) {
          setMenuKeyId([menuKey]);
          setOpenKey([menuKey]);
        }
        setMenuData([
          {
            label: '元数据管理',
            key: menuKey,
          },
          {
            label: '元数据查看',
            key: 'classifyRoot',
            children: [...newItems],
          },
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
          <TextToolTip text={item.classifyName} />
        </div>
      ),
      name: item.classifyName,
      key: item.id,
      isLeaf: item.isLeaf,
      type: item.isLeaf ? '' : menuKey, //通过后端isLeaf去判断是分类还是最底层
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
    addClassify({
      ...value,
      classifyType: menuKey,
      creator,
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
          name: 'classifyName',
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

  const handleAddFile = (e, item = {}) => {
    e.stopPropagation();
    getId();
    form.setFieldsValue({
      nodeMark: item.classifyName || 'root',
      node: item.id || 'root',
    });
    setVisible(true);
  };

  const handleMenuSelect = ({ item, key, keyPath, selectedKeys, domEvent }) => {
    setMenuKeyId(selectedKeys);
};

  const handleExpand = openKeys => {
    setOpenKey(openKeys);
  };

  const getSearchData = (arr = [], value) => {
    return arr.filter(item => {
      if (item.name.includes(value)) {
        return true;
      } else {
        if (item.children && item.children.length) {
          const newC = getSearchData(item.children, value);
          item.children = newC;
          if (newC?.length) {
            return true;
          }
        }
      }
    });
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
          <Menu
            mode="inline"
            items={menuData}
            onSelect={handleMenuSelect}
            openkey={openKey}
            selectedKeys={menuKeyId}
            onOpenChange={handleExpand}
          />
        </Col>
        <Col flex="8px" className="cutting-line" />
        <Col flex="auto" className="content-table">
          {menuKeyId[0] === menuKey ? (
            <ClassifyManagePage
              menuKeyId={menuKeyId[0]}
              getMenuData={getInitData}
              ref={classifyRef}
              node={menuKeyId[0]}
              pMenuKey={menuKey}
            />
          ) : (
            <MetadataLabelPage
              menuKeyId={menuKeyId[0]}
              getInitData={getInitData}
              getMenuData={getInitData}
              ref={pageRef}
            />
          )}
        </Col>
      </Row>
    </div>
  );
};
export default Index;
