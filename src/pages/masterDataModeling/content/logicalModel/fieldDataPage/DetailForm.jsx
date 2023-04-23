import React, { useEffect, useState } from "react";
import { Typography, Form, Row, Col, Input, Radio, Button, Select, Space, TreeSelect } from "antd";
import { standardManage, metadataManage } from "@api/dataAccessApi";
import { showInfo } from "@tool";
import TextToolTip from "@components/textToolTip";
const { getDetailData, saveDetailData } = standardManage.informationManageApi;
const { getClassifyOpt } = standardManage.publice;
const { getGatherTable, getGatherTableField } = metadataManage.publice;

const { Title } = Typography;

export default function DetailForm(props) {
  const { pid, dealSave, targetRowData, handleCancel } = props;
  const [form] = Form.useForm();
  const [reference, setReference] = useState(false);
  const [sourceSystemOpt, setSourceSystemOpt] = useState([]);
  const [sourceTableOpt, setSourceTableOpt] = useState([]);
  const [sourceFieldOpt, setSourceFieldOpt] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    getInitData();
  }, [targetRowData]);

  const getInitData = () => {
    //form表单回显
    getDetailData({
      dataModelId: pid,
      dataElementField: targetRowData.id,
    }).then(res => {
      const { data, state } = res.data;
      if (state) {
        form.resetFields();
        if (data.referenceCodeId) {
          setReference(true);
        }
        if (data.sourceSystem) {
          handleSourceSystemChange(data.sourceSystem);
        }
        if (data.sourceTable) {
          handleSourceTableChange(data.sourceTable);
        }
        setFormData(data || {})
        form.setFieldsValue({
          ...data,
          referenceCode: data.referenceCodeId ? true : false,
        });
      }
    });

    //获取来源系统树下拉
    getClassifyOpt({ classifyType: 'metadataLabelSet' }).then(res => {
      const { state, data } = res.data;
      if (state) {
        setSourceSystemOpt(treeDataTransform(data));
      }
    });
  };

  const treeDataTransform = data => {
    const arr = data.map(item => {
      return {
        value: item.id,
        title: <TextToolTip text={item.classifyName} />,
        id: item.id,
        isLeaf: item.isLeaf,
        // selectable: !item.children,
        children: !item.isLeaf && treeDataTransform(item.children),
      };
    });
    return arr;
  };

  const onFinish = value => {
    let data = Object.assign(formData, value);
    saveDetailData({ ...targetRowData, ...data, dataModelId: pid }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        dealSave();
      }
    });
  };

  const handleSourceSystemChange = value => {
    if (!value) return;
    getGatherTable({ classifyId: value }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const newData = data.map((item, index) => {
          return {
            label: item.value,
            value: item.id,
          };
        });
        setSourceTableOpt(newData);
      }
    });
  };

  const handleSourceTableChange = value => {
    if (!value) return;
    getGatherTableField({ tableGatherId: value }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const newData = data.map((item, index) => {
          return {
            label: item.value,
            value: item.id,
          };
        });
        setSourceFieldOpt(newData);
      }
    });
  };

  return (
    <div style={{ width: '100%' }}>
      <Form
        form={form}
        onFinish={onFinish}
        size="small"
        labelCol={{ span: 8 }}
        initialValues={{ referenceCode: false }}
      >
        <Title level={5}>字段属性</Title>
        <hr style={{ marginBottom: 20 }} />
        <Row className="baseAttribute">
          <Col span={8}>
            <Form.Item name="id" label="id:" hidden>
              <Input style={{ width: '100%' }} disabled />
            </Form.Item>
            <Form.Item name="primaryKey" label="是否主键:">
              <Radio.Group style={{ width: '100%' }}>
                <Radio value="true">是</Radio>
                <Radio value="false">否</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fieldNull" label="是否为空:">
              <Radio.Group style={{ width: '100%' }} disabled>
                <Radio value="true">是</Radio>
                <Radio value="false">否</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="fieldCode" label="字段编号:">
              <Input style={{ width: '100%' }} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fieldName" label="字段名称:">
              <Input style={{ width: '100%' }} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fieldComment" label="字段注释:">
              <Input style={{ width: '100%' }} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fieldType" label="字段类型:">
              <Input style={{ width: '100%' }} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fieldLength" label="字段长度:">
              <Input style={{ width: '100%' }} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fieldLength" label="字段默认值:">
              <Input style={{ width: '100%' }} disabled />
            </Form.Item>
          </Col>
        </Row>
        <Title level={5}>标准代码属性</Title>
        <hr style={{ marginBottom: 20 }} />
        <Row>
          <Col span={8}>
            <Form.Item name="referenceCodeId" label="是否引用:" hidden>
              <Input style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="referenceCode" label="是否引用:">
              <Radio.Group style={{ width: '100%' }} disabled>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        {reference ? (
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item name="referenceCodeNum" label="标准代码编号:" size="small">
                <Input style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="referenceCodeName" label="标准代码名称:">
                <Input style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="referenceComment" label="标准代码注释:">
                <Input style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
          </Row>
        ) : null}
        <Title level={5}>元数据来源属性</Title>
        <hr style={{ marginBottom: 20 }} />
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="sourceSystem" label="来源系统:">
              <TreeSelect
                style={{ width: '100%' }}
                treeData={sourceSystemOpt}
                onChange={handleSourceSystemChange}
                dropdownMatchSelectWidth={false}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="sourceTable" label="来源表:">
              <Select style={{ width: '100%' }} options={sourceTableOpt} onChange={handleSourceTableChange} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="sourceField" label="来源字段:">
              <Select style={{ width: '100%' }} options={sourceFieldOpt} />
            </Form.Item>
          </Col>
        </Row>
        <Title level={5} style={{ marginTop: 20 }}>
          管理属性
        </Title>
        <hr style={{ marginBottom: 20 }} />
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="coreFields" label="核心字段:">
              <Radio.Group style={{ width: '100%' }}>
                <Radio value="true">是</Radio>
                <Radio value="false">否</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="authority" label="权威字段:">
              <Radio.Group style={{ width: '100%' }}>
                <Radio value="true">是</Radio>
                <Radio value="false">否</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="sourceDepartment" label="来源部门:">
              <Input style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="maintenanceDepartment" label="数据维护部门:">
              <Input style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="desensitizationStrategyList" label="脱敏策略:">
              <Input style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="securityLevel" label="安全等级:">
              <Input style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <div style={{ textAlign: 'center' }}>
          <Space>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
            <Button onClick={handleCancel}>关闭</Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}
