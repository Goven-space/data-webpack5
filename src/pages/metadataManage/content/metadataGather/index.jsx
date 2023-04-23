import React, { useEffect, useState, useRef } from 'react';
import { Modal, Row, Col, Form, Menu } from 'antd';
import MetadataManagePage from './MetadataManagePage';
import ClassifyManagePage from '../classifyManage/ClassifyManagePage';
import CMForm from '@/components/cmForm';
import { getMenu } from '@tool';
import { standardManage } from '@api/dataAccessApi';
const { addList } = standardManage.classifyManagePageApi;
const { getClassifyOpt } = standardManage.publice;

const Index = ({ menuKey }) => {
  const [menuKeyId, setMenuKeyId] = useState([]);
  const [openKey, setOpenKey] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('新增分类');

  const [form] = Form.useForm();
  const formItemWidth = 300;
  const labelCol = { span: 6 };
  const creator = sessionStorage.getItem('userId');
  useEffect(() => {
    getInitData(true);
  }, [menuKey]);

  const getInitData = (init = false) => {
    //获取侧边栏数据
    getClassifyOpt({ classifyType: 'metadataLinkConfig' }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const newItems = getMenu(data, 'classifyName', 'id');
        setMenuData(newItems);
        if (init) {
          const key = getDefaultMenuKey(newItems);
          setMenuKeyId(key || '');
          setOpenKey([data[0]?.id || '']);
        }
      }
    });
  };

  const getDefaultMenuKey = (data = []) => {
    let key = '';
    data.some(item => {
      if (item.children?.length) {
        key = getDefaultMenuKey(item.children);
      } else {
        key = item.key;
      }
      return key;
    });
    return key ? [key] : [];
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

  const handleMenuSelect = ({ item, key, keyPath, selectedKeys, domEvent }) => {
    setMenuKeyId(selectedKeys);
  };

  const handleExpand = openKeys => {
    setOpenKey(openKeys);
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
        <Col flex="220px" className="content-menu">
          <Menu
            mode="inline"
            items={menuData}
            onSelect={handleMenuSelect}
            openKeys={openKey}
            selectedKeys={menuKeyId}
            onOpenChange={handleExpand}
          />
        </Col>
        <Col flex="8px" className="cutting-line" />
        <Col flex="auto" className="content-table">
          {menuKeyId[0] === 'metadataGather' ? (
            <ClassifyManagePage menuKeyId={menuKeyId[0]} getMenuData={getInitData} />
          ) : (
            <MetadataManagePage menuKeyId={menuKeyId[0]} />
          )}
        </Col>
      </Row>
    </div>
  );
};
export default Index;
