import React, { useEffect, useState } from "react";
import {
  Row,
  Space,
  Button,
  Col,
  Input,
  Table,
  Modal,
  Form,
  Tag,
  Dropdown,
  Menu,
} from "antd";
import Icon from "@components/icon";
import { look, refreshIcon } from "@/constant/icon.js";
import CMForm from "@/components/cmForm";
import { showInfo } from "@tool";
import { standardManage, metadataManage } from "@api/dataAccessApi";
import { paginationConfig } from "@tool";
import FieldConfigPag from "./FieldConfigPag";

const { getListField, saveFieldList } = metadataManage.metadataLabel;

const { Search } = Input;

export default function MetadataManagePage(props) {
  const { pid } = props;
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("新增");
  const [modalContentFlag, setModalContentFlag] = useState("form");
  const [id, setId] = useState(undefined);
  const [modalWidth, setModalWidth] = useState(1100);

  const [form] = Form.useForm();
  const formItemWidth = 300;
  const labelCol = { span: 8 };

  let searchData = {};
  const width = 150;

  const columns = [
    {
      title: '字段名称',
      dataIndex: 'fieldName',
      ellipsis: true,
      width,
    },
    {
      title: '中文名称',
      dataIndex: 'fieldComment',
      ellipsis: true,
      width,
    },
    {
      title: '类型',
      dataIndex: 'fieldType',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '长度',
      dataIndex: 'fieldLength',
      ellipsis: true,
      width: width - 70,
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '是否为空',
      dataIndex: 'fieldNull',
      ellipsis: true,
      width: width - 70,
      render: text => (text ? <Tag color="green">是</Tag> : <Tag color="orange">否</Tag>),
    },
    {
      title: '是否主键',
      dataIndex: 'primaryKey',
      ellipsis: true,
      width: width - 70,
      render: text => (text ? <Tag color="green">是</Tag> : <Tag color="orange">否</Tag>),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
      width,
      fixed: 'right',
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: width - 50,
      fixed: 'right',
      render: (text, record) => {
        return (
          <Space>
            <Button type="link" onClick={() => handleFieldLog(record)}>
              字段标签
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    getTableData();
    searchData = {};
  }, [pid]);

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }) => {
    getListField({
      ...pagination,
      filters: { tableGatherId: pid },
      searchFilters: {
        ...searchData,
      },
    }).then((res) => {
      const { state, rows, pageNo, pageSize, total } = res.data;
      if (state) {
        setDataSource(rows);
        setPageNo(pageNo);
        setPageSize(pageSize);
        setTotal(total);
      }
    });
  };

  const handleFieldLog = (record) => {
    setId(record.id);
    setVisible(true);
    setTitle(`${record.fieldName}-字段详情页`);
    setModalContentFlag("form");
		form.setFieldsValue({ ...record });
    setModalWidth(800);
  };

  const onSearch = (value) => {
    searchData = {
      fieldCode: value,
      fieldName: value,
      fieldComment: value,
    };
    getTableData({ pageNo: 1, pageSize: 10 });
  };

  const handleCancel = () => {
		form.resetFields()
    setVisible(false);
  };

  const refresh = () => {
    getTableData();
  };

  const onPageChange = (page, size) => {
    getTableData({ pageNo: page, pageSize: size });
  };

	const submitForm = (value) => {
     saveFieldList({
      ...value,
     }).then(res => {
      const {state, msg} = res.data
      if (state) {
        handleCancel();
        getTableData();
        showInfo(msg)
      }
    }); 
  };

	const cmFormConfig = {
    formOpts: {
      form,
      onFinish: submitForm,
      labelCol,
    },
    data: [
      {
        opts: {
          name: 'id',
          required: true,
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
          name: 'fieldComment',
          label: '字段标签',
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
          name: 'remark',
          label: '字段备注',
        },
        input: {
          style: {
            width: formItemWidth,
          },
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

  return (
    <div className="metadataManage-content">
      <Modal
        style={{
          top: 10,
        }}
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={modalWidth}
        centered
        destroyOnClose
        title={title}
      >
        {modalContentFlag === "config" ? (
          <FieldConfigPag
            id={pid}
            handleCancel={handleCancel}
            getTableData={getTableData}
          />
        ) : (
          <CMForm {...cmFormConfig} />
        )}
      </Modal>
      <div className="metadataManage-top">
        <Row>
          <Col span={17}>
            <Space>
              <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col span={7} style={{ textAlign: "right" }}>
            <Space>
              <Search
                placeholder="编号/字段注释/字段名称"
                allowClear
                onSearch={onSearch}
                style={{ width: 250 }}
              />
            </Space>
          </Col>
        </Row>
      </div>
      <div style={{ marginTop: 20 }}>
        <Table
          size="small"
          columns={columns}
          dataSource={dataSource}
          rowKey={row => row.id}
          scroll={{ x: "max-content" }}
          pagination={paginationConfig(
            pageNo,
            total,
            pageSize,
            onPageChange
          )} 
        />
      </div>
    </div>
  );
}
