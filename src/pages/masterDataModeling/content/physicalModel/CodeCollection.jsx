import React, { useEffect, useState, useRef } from "react";
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
  Popconfirm,
} from "antd";
import Icon from "@components/icon";
import {
  addIcon,
  refreshIcon,
  showIcon,
  exportIcon,
  syncOutlined,
} from "@/constant/icon.js";
import CMForm from "@/components/cmForm";
import { standardManage } from "@api/dataAccessApi";
import { paginationConfig, getTreeSelectData, showInfo } from "@tool";
import DeleteBtn from "@components/button";
import { showConfirm } from "@components/confirm";
import FieldLogPage from "./codeCollectionContent/FieldLogPage";
import SynchronizationPage from "./codeCollectionContent/SynchronizationPage"; //穿梭框
import SynProgress from "./codeCollectionContent/SynProgress";

const {
  getListCode,
  getCodeTableNameOpt,
  addListCode,
  deleteListCode,
  getModelField,
  exportList,
  codeSyncCreateTable,
  verifyCodeConfigTableExist,
  getCodeOpt,
  getDefaultConfig,
  codeSync,
} = standardManage.systemModelingApi;

const { Search } = Input;
const deF = {
  codeNum: "",
  codeName: "",
  codeComment: "",
  codeSort: "",
  classifyId: "",
  parentId: "",
};
const deSF = {
  codeItemName: "",
  codeItemValue: "",
  codeChildNodeCount: "",
  itemSort: "",
  enableName: "",
};
let fieldValue = { ...deF };
let fieldSubValue = { ...deSF };

export default function CodeCollectionContent(props) {
  const [selectKey, setSelectKey] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("新增");
  const [searchValue, setSearchValue] = useState("");
  const [codeTableNameOpt, setCodeTableNameOpt] = useState([]);
  const [filedOpt, setFiledOpt] = useState([]);
  const [filedItemOpt, setFiledItemOpt] = useState([]);
  const [referenceTypeOpt, setReferenceTypeOpt] = useState([]);
  const [referenceCodeOpt, setReferenceCodeOpt] = useState([]);
  const [id, setId] = useState(undefined);
  const [modalWidth, setModalWidth] = useState(1000);
  const [modalContentFlag, setModalContentFlag] = useState("form");
  const [currentType, setCurrentType] = useState("informationSetConfig");

  const [form] = Form.useForm();
  const progressRef = useRef();

  let searchData = {};
  const formItemWidth = 250;
  const width = 180;
  const labelCol = { span: 8 };

  const columns = [
    {
      title: "配置名称",
      key: "configName",
      dataIndex: "configName",
      width: width - 20,
      ellipsis: true,
    },
    {
      title: "基础代码表名",
      key: "codeTableName",
      dataIndex: "codeTableName",
      ellipsis: true,
      width,
    },
    {
      title: "基础代码名称",
      key: "codeName",
      dataIndex: "codeName",
      ellipsis: true,
      width,
    },
    {
      title: "基础代码值",
      key: "codeComment",
      dataIndex: "codeComment",
      ellipsis: true,
      width,
    },
    {
      title: "基础代码编号",
      key: "codeNum",
      dataIndex: "codeNum",
      ellipsis: true,
      width,
    },

    {
      title: "基础代码子项表名",
      key: "codeItemTableName",
      dataIndex: "codeItemTableName",
      ellipsis: true,
      width,
    },
    {
      title: "基础代码子项名称",
      key: "codeItemName",
      dataIndex: "codeItemName",
      width,
      ellipsis: true,
    },
    {
      title: "基础代码子项值",
      key: "codeItemValue",
      dataIndex: "codeItemValue",
      ellipsis: true,
      width,
      /*       render: (text) => {
        return text ? "是" : "否";
      }, */
    },
    {
      title: "基础代码父级节点",
      key: "parentId",
      dataIndex: "parentId",
      ellipsis: true,
      width,
    },
    {
      title: "操作",
      key: "action",
      dataIndex: "action",
      width,
      fixed: "right",
      render: (text, record) => {
        return (
          <Dropdown
            trigger={["click"]}
            overlay={
              <Menu>
                <Menu.Item key="edit">
                  <Button type="link" onClick={() => handleEdit(record)}>
                    编辑
                  </Button>
                </Menu.Item>
                {/*  <Menu.Item key="fieldLog">
                  <Button type="link" onClick={() => handleFieldLog(record)}>
                    字段日志
                  </Button>
                </Menu.Item> */}
              </Menu>
            }
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                操作
                <Icon type={showIcon} />
              </Space>
            </a>
          </Dropdown>
        );
      },
    },
  ];

  useEffect(() => {
    getTableData();
    getInitData();
    return () => {
      fieldValue = {};
      fieldSubValue = {};
    };
  }, []);

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }) => {
    getListCode({
      ...pagination,
      filters: {},
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

  const getInitData = () => {
    //获取基础代码表名下拉
    getCodeTableNameOpt().then((res) => {
      const { state, data } = res.data;
      if (state) {
        const newData = getTreeSelectData(
          data,
          "name",
          "id",
          true,
          "comment",
          "id"
        );
        setCodeTableNameOpt(newData);
      }
    });
  };

  const getCodeTableNameSelectData = (arr = []) => {
    return arr.map((item) => {
      if (item.children) {
        return {
          label: item.name,
          options: item.children.length
            ? getCodeTableNameSelectData(item.children)
            : [],
        };
      } else {
        return {
          label: `${item.name}-${item.comment}`,
          value: `${item.id}`,
        };
      }
    });
  };

  const handleFieldLog = (record) => {
    setId(record.id);
    setVisible(true);
    setTitle("字段日志");
    setModalWidth(1300);
  };

  const splitData = (data) => {
    if (!data || !data instanceof Object) return;
    const fieldValueArr = Object.keys(fieldValue);
    const fieldSubValueArr = Object.keys(fieldSubValue);
    for (const key in data) {
      if (fieldValueArr.includes(key)) {
        fieldValue[key] = data[key];
      } else if (fieldSubValueArr.includes(key)) {
        fieldSubValue[key] = data[key];
      }
    }
  };

  const handleEdit = (record) => {
    setModalContentFlag("form");
    setId(record.id);
    setVisible(true);
    setTitle("编辑");
    setModalWidth(1000);
    splitData(record);
    if (record.codeConfigType === "informationSetConfig") {
      //只有是信息集才需要请求下拉
      getModelFieldData(record.codeTableId, "codeTableName", true); //编辑时把下拉值显示回来
      getModelFieldData(record.codeItemTableId, "codeItemTableName", true);
      changeObjItem(record, "codeTableName", "codeTableId"); //只有是信息集的时候，才需要将两个字段置换
      changeObjItem(record, "codeItemTableName", "codeItemTableId");
    }
    setCurrentType(record.codeConfigType);
    form.setFieldsValue({
      ...record,
    });
  };

  const submitForm = (value) => {
    if (value.codeConfigType === "informationSetConfig") {
      changeObjItem(value, "codeTableName", "codeTableId");
      changeObjItem(value, "codeItemTableName", "codeItemTableId");
    }
    addListCode({ ...value, id }).then((res) => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        handleCancel();
        getTableData();
        form.resetFields();
      }
    });
  };

  const changeObjItem = (obj, c1, c2) => {
    let tableChange = "";
    tableChange = obj[c1]; //因为表名跟id存储的字段颠倒了，所以需要颠倒回来
    obj[c1] = obj[c2];
    obj[c2] = tableChange;
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
    setVisible(false);
    form.resetFields();
    if (progressRef.current) {
      progressRef.current.clear();
    }
  };

  const handleAdd = () => {
    setModalContentFlag("form");
    setVisible(true);
    setTitle("新增");
    setCurrentType("informationSetConfig");
    setFiledOpt([]);
    setFiledItemOpt([]);
    form.setFieldsValue({
      codeConfigType: "informationSetConfig",
    });
    setId(undefined);
    setModalWidth(1000);
  };

  const handelDelete = () => {
    deleteListCode({
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

  const handleExport = () => {
    exportList();
  };

  /* const handleSearchChange = (e) => {
		setSearchValue(e.target.value);
	} */

  const onPageChange = (page, size) => {
    getTableData({ pageNo: page, pageSize: size });
  };

  const referenceTypeChange = (value, label, extra) => {
    getReferenceCodeOpt(value);
  };

  //根据代码分类获取引用代码下拉
  const getReferenceCodeOpt = (value, init = true) => {
    if (!value) return;
    if (init) {
      form.setFieldsValue({
        referenceCodeId: undefined,
      });
    }
    getCodeOpt({ classifyId: value }).then((res) => {
      const { state, data } = res.data;
      if (state) {
        const newData = data.map((item) => ({
          label: item.codeName,
          value: item.id,
        }));
        setReferenceCodeOpt(newData);
      }
    });
  };

  const handleCodeTableNameSelect = (value, label, flag) => {
    flag === "codeTableName"
      ? form.setFieldsValue({ ...deF })
      : form.setFieldsValue({ ...deSF });
    getModelFieldData(value, flag);
    const data = label && label.length ? label[0].split("-")[0] : "";
    flag === "codeTableName" ? (fieldValue = {}) : (fieldSubValue = {});
    flag === "codeTableName"
      ? form.setFieldsValue({ codeTableId: data })
      : form.setFieldsValue({ codeItemTableId: data });
  };

  const getModelFieldData = (value, flag, edit = false) => {
    if (!value) {
      return;
    }
    getModelField({ dataModelId: value }).then((res) => {
      const { state, data } = res.data;
      if (state) {
        const newData = data.map((item) => ({
          label: `${item.fieldName}-${item.fieldComment}`,
          value: `${item.fieldName}`,
        }));
        if (flag === "codeTableName") {
          setFiledOpt(newData);
          if (edit) {
            disFieldOpt(newData, fieldValue, flag); //编辑的时候，要把已经选中的值禁止掉，在这里处理是因为只有这时候下拉值有了
          }
        } else {
          setFiledItemOpt(newData);
          disFieldOpt(newData, fieldSubValue, flag);
        }
      }
    });
  };

  const disFieldOpt = (arr = [], disOpt = {}, flag) => {
    const newArr = [...arr];
    for (const key in disOpt) {
      if (disOpt[key]) {
        const index = newArr.findIndex((item) => item.value === disOpt[key]);
        if (index >= 0) {
          newArr[index] = { ...newArr[index], disabled: true };
        }
      }
    }
    flag === "codeTableName" ? setFiledOpt(newArr) : setFiledItemOpt(newArr);
  };

  const onFieldChange = (value, field, flag) => {
    if (value) {
      flag === "field"
        ? (fieldValue[field] = value)
        : (fieldSubValue[field] = value);
    }
    deleteFieldOpt(value, field, flag);
  };

  const deleteFieldOpt = (value, field, flag) => {
    let data = value;
    const newFiledOpt = flag === "field" ? [...filedOpt] : [...filedItemOpt];
    if (!value) {
      //说明是清掉值，需要把禁止放回来
      data = flag === "field" ? fieldValue[field] : fieldSubValue[field];
      if (flag === "field") {
        fieldValue[field] = undefined;
      } else {
        fieldSubValue[field] = undefined;
      }
    }
    const index = newFiledOpt.findIndex((item) => item.value === data);
    if (index >= 0) {
      newFiledOpt[index] = {
        ...newFiledOpt[index],
        disabled: value ? true : false,
      };
      flag === "field"
        ? setFiledOpt(newFiledOpt)
        : setFiledItemOpt(newFiledOpt);
    }
  };

  const handleSynchronization = () => {
    if (!selectKey.length) {
      showConfirm("", "未选择配置项，是否使用默认配置？", verify);
    } else {
      verify();
    }
  };

  const verify = () => {
    verifyCodeConfigTableExist({ codeConfigId: selectedRows[0]?.id }).then(
      (res) => {
        if (res.data.state) {
          showInfo(res.data.msg);
          sny();
        } else {
          //核验不通过掉建表的接口
          showConfirm('', res.data.msg, createTable);
        }
      }
    );
  };

  const sny = (params) => {
    //开始同步
    setModalContentFlag("progress");
    setModalWidth(1000);
    setVisible(true);
    setTitle("同步");
    codeSync({ codeConfigId: selectedRows[0]?.id }).then((res) => {
      const { state, msg } = res.data;
      if (state) {
      } else {
        /* setVisible(false); */
      }
    });
  };

  const createTable = () => {
    codeSyncCreateTable({ codeSyncConfigId: selectedRows[0]?.id }).then(
      (res) => {
        const { state, msg } = res.data;
        if (state) {
          //建表成功调同步接口
          showInfo(msg);
          sny();
        }
      }
    );
  };

  const codeConfigTypeChange = (e) => {
    form.resetFields();
    form.setFieldsValue({
      codeConfigType: e.target.value,
    });
    setCurrentType(e.target.value);
    setFiledOpt([]);
    setFiledItemOpt([]);
    if (e.target.value === "defaultConfig") {
      getDefaultConfigData();
    }
  };

  const getDefaultConfigData = () => {
    getDefaultConfig().then((res) => {
      const { state, data } = res.data;
      if (state) {
        form.setFieldsValue({
          ...data,
        });
      }
    });
  };

  const type =
    currentType === "customConfig" || currentType === "defaultConfig"
      ? "input"
      : "treeSelect";
  const typeField =
    currentType === "customConfig" || currentType === "defaultConfig"
      ? "input"
      : "select";
  const hasChange =
    currentType === "customConfig" || currentType === "defaultConfig"
      ? false
      : true;
  const dis =
    currentType === "customConfig" || currentType === "informationSetConfig"
      ? false
      : true;

  const cmformConfig = {
    formOpts: {
      form,
      onFinish: submitForm,
      initialValues: {
        fieldNull: true,
        codeConfigType: "informationSetConfig",
      },
      labelCol,
      columns: 12,
    },
    data: [
      {
        opts: {
          name: "codeTableId",
          hidden: true,
        },
        input: {},
        columns: "none",
      },
      {
        opts: {
          name: "codeItemTableId",
          hidden: true,
        },
        input: {},
        columns: "none",
      },
      {
        opts: {
          name: "codeConfigType",
          label: "配置类型",
          required: true,
        },
        radioGroup: {
          options: [
            { label: "信息集配置", value: "informationSetConfig" },
            { label: "自定义配置", value: "customConfig" },
            { label: "默认配置", value: "defaultConfig" },
          ],
          optionType: "button",
          onChange: codeConfigTypeChange,
        },
        columns: 24,
      },
      {
        opts: {
          name: "configName",
          label: "配置名称",
          required: true,
        },
        input: {
          style: {
            width: formItemWidth,
          },
          disabled: dis,
        },
        columns: 24,
      },
      {
        opts: {
          name: "codeTableName",
          label: "基础代码表名",
          required: true,
        },
        [type]: {
          style: {
            width: formItemWidth,
          },
          treeData: codeTableNameOpt,
          disabled: dis,
          onChange: hasChange
            ? (value, label, extra) =>
                handleCodeTableNameSelect(value, label, "codeTableName")
            : undefined,
        },
      },
      {
        opts: {
          name: "codeItemTableName",
          label: "基础代码子项表名",
          required: true,
        },
        [type]: {
          style: {
            width: formItemWidth,
          },
          treeData: codeTableNameOpt,
          disabled: dis,
          onChange: hasChange
            ? (value, label) =>
                handleCodeTableNameSelect(value, label, "codeItemTableName")
            : undefined,
        },
      },
      {
        opts: {
          name: "codeNum",
          label: "基础代码编号",
          required: true,
        },
        [typeField]: {
          style: {
            width: formItemWidth,
          },
          options: filedOpt,
          onChange: hasChange
            ? (value) => onFieldChange(value, "codeNum", "field")
            : undefined,
          disabled: dis,
        },
      },
      {
        opts: {
          name: "codeItemName",
          label: "基础代码子项名称",
          required: true,
        },
        [typeField]: {
          style: {
            width: formItemWidth,
          },
          options: filedItemOpt,
          disabled: dis,
          onChange: hasChange
            ? (value) => onFieldChange(value, "codeItemName", "fieldSub")
            : undefined,
        },
      },
      {
        opts: {
          name: "codeName",
          label: "基础代码名称",
          required: true,
        },
        [typeField]: {
          style: {
            width: formItemWidth,
          },
          options: filedOpt,
          disabled: dis,
          onChange: hasChange
            ? (value) => onFieldChange(value, "codeName", "field")
            : undefined,
        },
      },
      {
        opts: {
          name: "codeItemValue",
          label: "基础代码子项值",
          required: true,
        },
        [typeField]: {
          style: {
            width: formItemWidth,
          },
          disabled: dis,
          options: filedItemOpt,
          onChange: hasChange
            ? (value) => onFieldChange(value, "codeItemValue", "fieldSub")
            : undefined,
        },
      },
      {
        opts: {
          name: "codeComment",
          label: "基础代码值",
          required: true,
        },
        [typeField]: {
          style: {
            width: formItemWidth,
          },
          disabled: dis,
          options: filedOpt,
          onChange: hasChange
            ? (value) => onFieldChange(value, "codeComment", "field")
            : undefined,
        },
      },
      {
        opts: {
          name: "codeChildNodeCount",
          label: "基础代码子节点数量",
          required: true,
        },
        [typeField]: {
          style: {
            width: formItemWidth,
          },
          options: filedItemOpt,
          disabled: dis,
          onChange: hasChange
            ? (value) => onFieldChange(value, "codeChildNodeCount", "fieldSub")
            : undefined,
        },
      },
      {
        opts: {
          name: "codeSort",
          label: "基础代码排序",
          required: true,
          initialValue: 10000
        },
        [typeField]: {
          style: {
            width: formItemWidth,
          },
          options: filedOpt,
          disabled: dis,
          onChange: hasChange
            ? (value) => onFieldChange(value, "codeSort", "field")
            : undefined,
        },
      },
      {
        opts: {
          name: "itemSort",
          label: "基础子项代码排序",
          required: true,
          initialValue: 10000
        },
        [typeField]: {
          style: {
            width: formItemWidth,
          },
          options: filedItemOpt,
          disabled: dis,
          onChange: hasChange
            ? (value) => onFieldChange(value, "itemSort", "fieldSub")
            : undefined,
        },
      },
      {
        opts: {
          name: "classifyId",
          label: "基础代码所属分类",
          required: true,
        },
        [typeField]: {
          style: {
            width: formItemWidth,
          },
          disabled: dis,
          options: filedOpt,
          onChange: hasChange
            ? (value) => onFieldChange(value, "classifyId", "field")
            : undefined,
        },
      },
      {
        opts: {
          name: "enableName",
          label: "基础代码子项是否启用",
          required: true,
        },
        [typeField]: {
          style: {
            width: formItemWidth,
          },
          disabled: dis,
          options: filedItemOpt,
          onChange: hasChange
            ? (value) => onFieldChange(value, "enableName", "fieldSub")
            : undefined,
        },
      },
      {
        opts: {
          name: "parentId",
          label: "基础代码父级节点",
          required: true,
        },
        [typeField]: {
          style: {
            width: formItemWidth,
          },
          disabled: dis,
          options: filedOpt,
          onChange: hasChange
            ? (value) => onFieldChange(value, "parentId", "field")
            : undefined,
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
        style={{
          top: 10,
        }}
        className="metadataManage-content-modal"
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={modalWidth}
        destroyOnClose
        title={title}
      >
        {modalContentFlag === "syc" ? (
          <SynchronizationPage id={id} />
        ) : modalContentFlag === "progress" ? (
          <SynProgress ref={progressRef} />
        ) : (
          <CMForm {...cmformConfig} />
        )}
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
              {/* <Button>修改</Button> */}
              <DeleteBtn
                disabled={selectKey.length ? false : true}
                onClick={handelDelete}
              ></DeleteBtn>
              {/* <Popconfirm
                placement="top"
                title="未选择配置项，是否使用默认配置？"
                onConfirm={handleSynchronization}
                okText="是"
                cancelText="否"
              ></Popconfirm> */}
              <Button
                type="primary"
                icon={<Icon type={syncOutlined} />}
                onClick={handleSynchronization}
              >
                同步
              </Button>

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
            onChange: (key, selectedRows) => {
              setSelectKey(key);
              setSelectedRows(selectedRows);
            },
          }}
          rowKey={(row) => row.id}
          scroll={{ x: "max-content", y: 560 }}
          pagination={paginationConfig(pageNo, total, pageSize, onPageChange)}
        />
      </div>
    </div>
  );
}
