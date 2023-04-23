import React, { useEffect, useState, useRef } from 'react';
import { Modal, Row, Col, Form, Menu } from 'antd';
import FileLabelPage from './fileLabelPage';
import ClassifyManagePage from '../classifyManage/ClassifyManagePage';
import { getMenu } from '@tool';
import { standardManage, metadataManage } from '@api/dataAccessApi';
import CMForm from '@/components/cmForm';

const { getIdOpt } = standardManage.classifyManagePageApi;
const { getClassifyOpt } = standardManage.publice;
const { addClassify } = metadataManage.publice;

const Index = ({ menuKey }) => {
  const [menuKeyId, setMenuKeyId] = useState([menuKey]);
  const [menuData, setMenuData] = useState([]);
  const [openKey, setOpenKey] = useState([]);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('新增分类');

  const [form] = Form.useForm();
  const formItemWidth = 300;
  const labelCol = { span: 6 };
  const creator = sessionStorage.getItem('userId');
  const pageRef = useRef();
  const classifyRef = useRef();

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
            label: '文件分类管理',
            key: menuKey,
          },
          {
            label: '文件查看',
            key: 'classifyRoot',
            children: [...newItems],
          },
        ]);
      }
    });
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
        <Col flex="220px" className="content-menu info-content">
          <Menu
            mode="inline"
            items={menuData}
            onSelect={handleMenuSelect}
            openKey={openKey}
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
            <FileLabelPage
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
