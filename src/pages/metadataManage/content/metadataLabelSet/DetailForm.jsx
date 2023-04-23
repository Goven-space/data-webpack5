import React, { useEffect, useState } from "react";
import { Typography, Form, Row, Col, Input, Radio, Button } from "antd";
import { standardManage } from "@api/dataAccessApi";
import { showInfo } from "@tool";
const { getDetailData, saveDetailData } = standardManage.informationManageApi;

const { Title } = Typography;

export default function DetailForm(props) {
  const { pid, id, dealSave } = props;
  const [form] = Form.useForm();
  const [reference, setReference] = useState(false);
  useEffect(() => {
    getInitData();
  }, [id]);

  const getInitData = () => {
    getDetailData({
      dataModelId: pid,
      dataElementField: id,
    }).then((res) => {
      const { data, state } = res.data;
      if (state) {
        form.resetFields();
        if (data.referenceCodeId) {
          setReference(true);
        }
        form.setFieldsValue({
          ...data,
          referenceCode: data.referenceCodeId ? true : false,
        });
      }
    });
  };

  const onFinish = (value) => {
    saveDetailData({ ...value, dataModelId: pid, dataElementField: id }).then(
      (res) => {
        const { state, msg } = res.data;
        if (state) {
          showInfo(msg);
          dealSave();
        }
      }
    );
  };

  return (
    <div style={{ width: "100%" }}>
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
              <Input style={{ width: "100%" }} disabled />
            </Form.Item>
            <Form.Item name="primaryKey" label="是否主键:">
              <Radio.Group style={{ width: "100%" }}>
                <Radio value="true">是</Radio>
                <Radio value="false">否</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fieldNull" label="是否为空:">
              <Radio.Group style={{ width: "100%" }} disabled>
                <Radio value="true">是</Radio>
                <Radio value="false">否</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="fieldCode" label="字段编号:">
              <Input style={{ width: "100%" }} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fieldName" label="字段名称:">
              <Input style={{ width: "100%" }} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fieldComment" label="字段注释:">
              <Input style={{ width: "100%" }} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fieldType" label="字段类型:">
              <Input style={{ width: "100%" }} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fieldLength" label="字段长度:">
              <Input style={{ width: "100%" }} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fieldLength" label="字段默认值:">
              <Input style={{ width: "100%" }} disabled />
            </Form.Item>
          </Col>
        </Row>
        <Title level={5}>标准代码属性</Title>
        <hr style={{ marginBottom: 20 }} />
        <Row>
          <Col span={8}>
            <Form.Item name="referenceCodeId" label="是否引用:" hidden>
              <Input style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="referenceCode" label="是否引用:">
              <Radio.Group style={{ width: "100%" }} disabled>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        {reference ? (
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="referenceCodeNum"
                label="标准代码编号:"
                size="small"
              >
                <Input style={{ width: "100%" }} disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="referenceCodeName" label="标准代码名称:">
                <Input style={{ width: "100%" }} disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="referenceComment" label="标准代码注释:">
                <Input style={{ width: "100%" }} disabled />
              </Form.Item>
            </Col>
          </Row>
        ) : null
        }
        <Title level={5}>元数据来源属性</Title>
        <hr style={{ marginBottom: 20 }} />
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="sourceSystem" label="来源系统:">
              <Input style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="sourceTable" label="来源表:">
              <Input style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="sourceField" label="来源字段:">
              <Input style={{ width: "100%" }} />
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
              <Radio.Group style={{ width: "100%" }}>
                <Radio value="true">是</Radio>
                <Radio value="false">否</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="authority" label="权威字段:">
              <Radio.Group style={{ width: "100%" }}>
                <Radio value="true">是</Radio>
                <Radio value="false">否</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="sourceDepartment" label="来源部门:">
              <Input style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="maintenanceDepartment" label="数据维护部门:">
              <Input style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="desensitizationStrategyList" label="脱敏策略:">
              <Input style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="securityLevel" label="安全等级:">
              <Input style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <div style={{ textAlign: "center" }}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </div>{" "}
      </Form>
    </div>
  );
}
