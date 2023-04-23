import React, { useEffect, useState, useContext } from "react";
import { Row, TreeSelect, Button, Col, Transfer, Modal, Form } from "antd";
import {standardManage} from "@api/dataAccessApi";
import MainContext from "@store";
import { showInfo, getTreeSelectData } from "@tool";
import CMForm from "@/components/cmForm";

const {
  getTypeOpt,
  getFieldOpt,
  saveConfig,
  showField,
  checkField,
  addCustom,
} = standardManage.informationManageApi;
const { getFieldTypeOpt, getCodeTypeOpt, getCodeOpt, listStructureTree } = standardManage.metaDataManageApi;
const { codeSyncModel } = standardManage.systemModelingApi;
const { getFieldTypeDataElementOpt } = standardManage.publice;

export default function FieldConfigPag({ id, handleCancel }) {
  const [mockData, setMockData] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState([]);
  const [fieldTypeOpt, setFieldTypeOpt] = useState([]);
  const [referenceTypeOpt, setReferenceTypeOpt] = useState([]);
  const [referenceCodeOpt, setReferenceCodeOpt] = useState([]);

  const [form] = Form.useForm();

  const formItemWidth = 300;
  const width = 150;
  const labelCol = { span: 6 };
  const align = "center";

  useEffect(() => {
    getInitData();
    /* getShowField(); */
  }, [id]);

  const getInitData = () => {
    getTypeOpt({ classifyType: "dataElement" }).then((res) => {
      const { state, data } = res.data;
      if (state) {
        const newData = getTreeSelectData(data, "classifyName", "id", true);
        setTreeData(newData);
      }
    });
  };

  const getAddFieldInitData = () => {
    //获取字段类型下拉
    getFieldTypeDataElementOpt({ type: localStorage.getItem("type") }).then(
      (res) => {
        const { state, data } = res.data;
        if (state) {
          const newData = [];
          for (const key in data) {
            newData.push({
              label: key,
              value: key,
            });
          }
          setFieldTypeOpt(newData);
        }
      }
    );

    //获取代码分类下拉
    getCodeTypeOpt({ classifyType: "code" }).then((res) => {
      const { state, data } = res.data;
      if (state) {
        const newData = getTreeSelectData(data, "classifyName", "id", true);
        setReferenceTypeOpt(newData);
      }
    }); /* */
    /*  listStructureTree().then((res) => {
      const { state, data } = res.data;
      if (state) {
        const newData = getTreeSelectData(data, "name", "id", true);
        setReferenceTypeOpt(newData);
      }
    }); */
  };

  const getShowField = () => {
    showField({ dataModelId: id }).then((res) => {
      const { data, state } = res.data;
      if (state) {
        let newData = "";
        if (data.lastConfigClassifyId) {
          const lastConfigClassifyId = data.lastConfigClassifyId;
          newData = lastConfigClassifyId.split(",");
          setValue(newData);
          getMockData(newData);
        } else {
          setValue([]);
        }
        setTargetKeys(data.fieldIds); //后端给的是数组
      }
    });
  };

  const onTypeChange = (value) => {
    setValue(value);
    if (value && value.length) {
      getMockData(value);
    } else {
      setTargetKeys([]);
      setMockData([]);
    }
  };

  const getMockData = (value = []) => {
    getFieldOpt({ classifyIds: value.join(",") }).then((res) => {
      const { state, data } = res.data;
      if (state) {
        const newData = data.map((item) => ({
          key: item.id,
          title: `${item.fieldName}-${item.fieldComment}-${item.metadataType}`,
        }));
        setMockData(newData);
      }
    });
  };

  const handleChange = (targetKeys, direction, moveKeys) => {
    if (direction === "right" && targetKeys?.length) {
      getCheckField(targetKeys);
    } else {
      setTargetKeys(targetKeys);
    }
  };

  const getCheckField = (value = []) => {
    checkField({ fieldIds: value.join(), dataModelId: id }).then((res) => {
      const { state } = res.data;
      if (state) {
        setTargetKeys(value);
      }
    });
  };

  const renderFooter = (props) => {
    /* if (direction === "left") {
      return (
        <Button
          size="small"
          style={{
            float: "left",
            margin: 5,
          }}
          onClick={getMock}
        >
          Left button reload
        </Button>
      );
    }

    return (
      <Button
        size="small"
        style={{
          float: "right",
          margin: 5,
        }}
        onClick={getMock}
      >
        Right button reload
      </Button>
    ); */
  };

  const handleSave = () => {
    saveConfig({
      dataModelId: id,
      fieldIds: targetKeys.join(","),
      lastConfigClassifyId: value?.join(),
    }).then((res) => {
      if (res.data?.state) {
        showInfo("配置成功！");
        handleCancel();
      }
    });
  };

  const submitForm = (value) => {
    addCustom({ ...value, metadataType: "custom" }).then((res) => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        handleModalCancel();
      }
    });
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

  const handleCustom = () => {
    getAddFieldInitData();
    setVisible(true);
  };

  const handleModalCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  const cmformConfig = {
    formOpts: {
      form,
      onFinish: submitForm,
      initialValues: {
        fieldNull: true,
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
          name: "classifyId",
          hidden: true,
        },
        input: {},
      },
      {
        opts: {
          name: "fieldCode",
          label: "编号",
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
          name: "fieldName",
          label: "字段名称",
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
          name: "fieldComment",
          label: "字段注释",
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
          name: "fieldType",
          label: "字段类型",
          required: true,
          labelCol,
        },
        select: {
          options: fieldTypeOpt,
          style: {
            width: formItemWidth,
          },
        },
      },
      {
        opts: {
          name: "fieldLength",
          label: "字段长度",
          labelCol,
        },
        number: {
          style: {
            width: formItemWidth,
          },
        },
      },
      {
        opts: {
          name: "fieldRadixPoint",
          label: "字段小数点",
          labelCol,
        },
        number: {
          min: 0,
          style: {
            width: formItemWidth,
          },
        },
      },
      /* {
        opts: {
          name: "referenceType",
          label: "代码分类",
          labelCol,
        },
        treeSelect: {
          style: {
            width: formItemWidth,
          },
          treeData: referenceTypeOpt,
          onChange: referenceTypeChange,
        },
      }, */
      {
        opts: {
          name: "referenceCodeId",
          label: "引用标准代码",
          labelCol,
        },
        treeSelect: {
          style: {
            width: formItemWidth,
          },
          treeData: referenceTypeOpt,
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
          name: "fieldNull",
          label: "是否为空",
          required: true,
          labelCol,
        },
        radioGroup: {
          style: {
            width: formItemWidth,
          },
          options: [
            {
              label: "是",
              value: true,
            },
            {
              label: "否",
              value: false,
            },
          ],
        },
      },
      {
        opts: {
          name: "defaultValue",
          label: "字段默认值",
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
              onClick: handleModalCancel,
            },
            title: "取消",
          },
        ],
      },
    ],
  };

  return (
    <div>
      <Modal
        style={{
          top: 10,
        }}
        visible={visible}
        footer={null}
        onCancel={handleModalCancel}
        width={600}
        destroyOnClose
        title={"新增自定义字段"}
      >
        {<CMForm {...cmformConfig} />}
      </Modal>
      <Row>
        <Col span={20}>
          选择分类：
          <TreeSelect
            multiple
            style={{ width: "310px" }}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            treeData={treeData}
            placeholder="请选择分类"
            treeDefaultExpandAll
            onChange={onTypeChange}
            value={value}
          />
        </Col>
        {/* <Col span={4}>
          <Button type="primary" onClick={handleCustom}>
            自定义字段
          </Button>
        </Col> */}
      </Row>
      <div style={{ marginTop: 20 }}>
        <Transfer
          dataSource={mockData}
          showSearch
          listStyle={{
            width: 400,
            height: 500,
          }}
          targetKeys={targetKeys}
          onChange={handleChange}
          render={(item) => `${item.title}`}
          footer={renderFooter}
        />
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}
