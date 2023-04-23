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
  Dropdown,
  Menu,
  Tag,
} from "antd";
import Icon from "@components/icon";
import {
  addIcon,
  refreshIcon,
} from "@/constant/icon.js";
import CMForm from "@/components/cmForm";
import { showInfo } from "@tool";
import { standardManage } from "@api/dataAccessApi";
import { paginationConfig } from "@tool";
import DeleteBtn from "@components/button";

const {
  getListFieldData,
  addListFieldData,
  deleteListFieldData,
  editListFieldData,
} = standardManage.codeSetManageApi;
const { Search } = Input;

export default function FieldDataPage({ id }) {
  const [selectKey, setSelectKey] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("新增");
  const [modalWidth, setModalWidth] = useState(500);

  const [form] = Form.useForm();

  let searchData = {};
  const formItemWidth = 300;
  const width = 150;
  const labelCol = { span: 6 };
  const align = "center";

  const columns = [
    {
      title: "序号",
      key: "index",
      dataIndex: "index",
      width: width - 20,
      render: (text, record, index) => {
        return index + 1 + (pageNo - 1) * pageSize;
      },
    },
    {
      title: "代码名称",
      key: "item_code_name",
      dataIndex: "item_code_name",
      width: width - 20,
      ellipsis: true,
    },
    {
      title: "代码名称拼写",
      key: "item_code_name_spell",
      dataIndex: "item_code_name_spell",
      width: width - 20,
      ellipsis: true,
    },
    {
      title: "代码名称说明",
      key: "item_code_name_explain",
      dataIndex: "item_code_name_explain",
      width: width - 20,
      ellipsis: true,
    },
    {
      title: "代码值",
      key: "item_code_value",
      dataIndex: "item_code_value",
      ellipsis: true,
      width: width,
    },
    {
      title: "代码字母码",
      key: "item_code_alpha_code",
      dataIndex: "item_code_alpha_code",
      ellipsis: true,
      width: width,
    },
    {
      title: "启用状态",
      key: "enable",
      dataIndex: "enable",
      ellipsis: true,
      width: width,
      render: (text) =>
        text ? <Tag color="green">是</Tag> : <Tag color="orange">否</Tag>,
    },
    {
      title: "排序",
      key: "sort",
      dataIndex: "sort",
      ellipsis: true,
      width: width - 30,
    },
    {
      title: "操作",
      key: "action",
      dataIndex: "action",
      width: width,
      fixed: "right",
      render: (text, record) => {
        return (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)} size="small">
              编辑
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    getTableData();
  }, [id]);

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }) => {
    getListFieldData({
      ...pagination,
      filters: { parent_id: id },
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

  const handleEdit = (record) => {
    setVisible(true);
    setTitle("编辑");
    setModalWidth(500);
    form.setFieldsValue({ ...record });
  };

  const submitForm = (value) => {
    let handleUrl = title === "新增" ? addListFieldData : editListFieldData;
    handleUrl({ ...value, parent_id: id }).then((res) => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        handleCancel();
        getTableData();
        form.resetFields();
      }
    });
  };

  const onSearch = (value) => {
    searchData = {
      num: value,
      item_code_name: value,
      enable: value,
    };
    getTableData({ pageNo: 1, pageSize: 10 });
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleAdd = () => {
    setVisible(true);
    setTitle("新增");
    setModalWidth(500);
  };

  const handelDelete = () => {
    deleteListFieldData({
      ids: selectKey.join(),
    }).then((res) => {
      const { state, msg } = res.data;
      if (state) {
        setSelectKey([]);
        getTableData();
      }
    });
  };

  const refresh = () => {
    getTableData();
  };

  const onPageChange = (page, size) => {
    getTableData({ pageNo: page, pageSize: size });
  };

  const cmformConfig = {
    formOpts: {
      form,
      onFinish: submitForm,
      initialValues: {
        enable: true,
      },
    },
    data: [
      {
        opts: {
          name: "id",
          hidden: true,
        },
        input: {},
      },
      {
        opts: {
          name: "item_code_name",
          label: "代码名称",
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
          name: "item_code_name_spell",
          label: "代码名称拼写",
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
          name: "item_code_name_explain",
          label: "代码名称说明",
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
          name: "item_code_value",
          label: "代码值",
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
          name: "item_code_alpha_code",
          label: "代码字母码",
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
          name: "enable",
          label: "启用状态",
          required: 1,
          labelCol,
        },
        radioGroup: {
          style: {
            width: formItemWidth,
          },
          options: [
            {
              label: "是",
              value: 1,
            },
            {
              label: "否",
              value: 0,
            },
          ],
        },
      },
      {
        opts: {
          name: "sort",
          label: "排序",
          labelCol,
          required: true,
          initialValue: 10000
        },
        number: {
          style: {
            width: formItemWidth,
          },
        },
      },
      {
        opts: {
          className: "page-form-footer",
        },
        button: [
          {
            opts: {
              type: "primary",
              htmlType: "submit",
            },
            title: "确认",
          },
          {
            opts: {
              onClick: handleCancel,
            },
            title: "取消",
          },
        ],
      },
    ],
  };

  return (
    <div className="metadataManage-content">
      <Modal
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={modalWidth}
        destroyOnClose={false}
        title={title}
      >
        <CMForm {...cmformConfig} />
      </Modal>
      <div className="metadataManage-top">
        <Row>
          <Col span={17}>
            <Space>
              <Button
                type="primary"
                icon={<Icon type={addIcon} />}
                onClick={handleAdd}
              >
                新增
              </Button>
              <DeleteBtn
                disabled={selectKey.length ? false : true}
                onClick={handelDelete}
              ></DeleteBtn>
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
                /* value={searchValue} 
                onChange={handleSearchChange}*/
              />
              {/* <Button icon={<Icon type={resetIcon} />}>重置</Button> */}
            </Space>
          </Col>
        </Row>
      </div>
      <div style={{ marginTop: 20 }}>
        <Table
          size="small"
          columns={columns}
          dataSource={dataSource}
          rowSelection={{
            selectedRowKeys: selectKey,
            onChange: (key) => setSelectKey(key),
          }}
          rowKey={(row) => row.id}
          pagination={paginationConfig(pageNo, total, pageSize, onPageChange)}
        />
      </div>
    </div>
  );
}
