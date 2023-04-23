import React, { useEffect, useMemo, useState, useImperativeHandle, forwardRef } from 'react';
import { Card, Avatar, Badge, List, Typography, Image, Modal, Form } from 'antd';
import { metadataManage } from '@api/dataAccessApi';
import CMForm from '@/components/cmForm';
import { showInfo } from '@tool';
import defaultImg from '@/assets/apiportal.png';
const { getDatabaseType, saveList } = metadataManage.linkConfigManage;

const { Meta } = Card;
const { Title } = Typography;

const DataBaseType = ({ menuKeyId, getTableData, getDatabaseContent }, ref) => {
  const host = localStorage.getItem('currentServerHost');
  const labelCol = { span: 5 };
  const formItemWidth = 600;
  const [form] = Form.useForm();

  const [visible, setVisible] = useState(false);
  const [driver, setDriver] = useState({});
  const [title, setTitle] = useState('新增');
  const [modalWidth, setModalWidth] = useState(900);
  const [modules, setModules] = useState({
    relationalDatabase: [],
    nonRelationalDatabase: [],
  });

  useImperativeHandle(ref, () => ({
    handleEdit,
  }));

  useEffect(() => {
    getType();
  }, []);

  const getType = () => {
    getDatabaseType().then(res => {
      const { state, data } = res.data;
      if (state) {
        setModules(data);
      }
    });
  };

  /* const getDatabaseContent = (driver) => {
    setDriver(driver);
    setVisible(true);
  }; */

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  const handleEdit = record => {
    setTitle('编辑');
    setVisible(true);
    const crrentDatabaseType = modules.find(item => {});
    form.setFieldsValue({ ...record });
  };

  const submitForm = value => {
    saveList({ ...value, classifyId: menuKeyId, configType: 'Driver' }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        handleCancel();
        getTableData();
        form.resetFields();
      }
    });
  };

  const handleTest = () => {};

  const cmFormConfig = useMemo(() => {
    return {
      formOpts: {
        form,
        onFinish: submitForm,
        labelCol,
        initialValues: {
          changePassword: false,
          state: '1',
        },
      },
      data: [
        {
          opts: {
            name: 'id',
            hidden: true,
          },
          input: {},
        },
        {
          opts: {
            name: 'classifyId',
            hidden: true,
          },
          input: {},
        },
        {
          opts: {
            name: 'configName',
            label: '数据源名称',
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
            name: 'userName',
            label: '用户名',
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
            name: 'password',
            label: '密码',
          },
          password: {
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'changePassword',
            label: '加密密码',
            help: '选择是表示保存时对密码进行一次加密',
          },
          radioGroup: {
            options: [
              { label: '是', value: true },
              { label: '否', value: false },
            ],
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'driverClass',
            label: '数据库驱动Class',
            help: '指定数据源所需要的驱动类JDBC或者ODBC驱动Class(支持手动填写)',
            required: true,
          },
          autoComplete: {
            style: {
              width: formItemWidth,
            },
            options:
              driver?.driverClass?.map(item => ({
                label: item,
                value: item,
              })) || [],
          },
        },
        {
          opts: {
            name: 'jdbcUrl',
            label: '链接数据源URL',
            help: '指定链接数据源的jdbc Url配置(支持手动填写)',
            required: true,
          },
          autoComplete: {
            style: {
              width: formItemWidth,
            },
            options:
              driver?.jdbcUrl?.map(item => ({
                label: item,
                value: item,
              })) || [],
          },
        },
        {
          opts: {
            name: 'props',
            label: '其他链接属性',
            help: '指定数据库的其他链接配置属性(每行一个如:remarksReporting=true)',
          },
          textarea: {
            style: {
              width: formItemWidth,
            },
            rows: 4,
          },
        },
        {
          opts: {
            name: 'state',
            label: '状态',
          },
          radioGroup: {
            options: [
              { label: '启用', value: '1' },
              { label: '停用', value: '0' },
            ],
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'remark',
            label: '备注',
          },
          textarea: {
            style: {
              width: formItemWidth,
            },
            rows: 4,
          },
        },
        /* {
          opts: {
            name: "sort",
            label: "排序",
            required: true,
            initialValue: 10000
          },
          number: {
            style: {
              width: formItemWidth,
            },
          },
        }, */
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
                type: 'primary',
                onClick: handleTest,
              },
              title: '测试连接',
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
  }, [driver]);

  const content = useMemo(() => {
    const content = [];
    for (const key in modules) {
      content.push(
        <div className="RelationalType">
          <Title level={5} style={{ marginBottom: 20 }}>
            {key === 'relationalDatabase'
              ? '关系型数据库'
              : key === 'nonRelationalDatabase'
              ? '大数据型数据库'
              : '消息型数据库'}
          </Title>
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={modules[key]}
            renderItem={item => (
              <List.Item>
                <Card
                  hoverable={true}
                  style={{ backgroundColor: item.backgroundColor || '#fff' }}
                  onClick={() =>
                    getDatabaseContent(item.title, {
                      driverClass: item.driverClass,
                      jdbcUrl: item.jdbcUrl,
                    })
                  }
                >
                  <Meta
                    avatar={
                      <Badge
                        count={item.count}
                        overflowCount={999}
                        style={{
                          backgroundColor: item.countColor || '#52c41a',
                        }}
                      >
                        <Image
                          size={64}
                          shape="square"
                          src={`${host}${item.src}`}
                          alt={item.title}
                          preview={false}
                        />
                      </Badge>
                    }
                    title={<b>{item.title}</b>}
                    description={item.description}
                  />
                </Card>
              </List.Item>
            )}
          />
        </div>
      );
    }
    return content;
  }, [modules]);

  return (
    <div>
      <Modal
        style={{
          top: 10,
        }}
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={modalWidth}
        destroyOnClose
        title={title}
      >
        {<CMForm {...cmFormConfig} />}
      </Modal>
      <div>{content}</div>
    </div>
  );
};

export default forwardRef(DataBaseType);
