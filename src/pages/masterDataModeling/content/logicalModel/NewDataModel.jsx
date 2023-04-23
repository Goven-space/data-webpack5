import React, { useState, useEffect, useRef } from 'react';
import { Form, Select, Input, Button, Radio, Space, TreeSelect, InputNumber, Tabs, Checkbox } from 'antd';
import { masterDataManage, standardManage } from '@api/dataAccessApi';
import { showInfo, showError, getTreeSelectData } from '@tool';
import { isArray } from 'lodash';

const { getIdOpt, getPersonJsonByDeptId } = masterDataManage.modelManage;
const { addList, editList, getAppsSelect, getListFlow } = standardManage.informationManageApi;
const { getInfoClassifySelect, getAppList, getDataSourceLink } = standardManage.publice;

//新增关系数据库数据模型
const FormItem = Form.Item;

function NewDataModel(props) {
  const { modalType, targetData, classifyId, menuParentId, handleCancel, currentItem } = props;

  const [treeList, setTreeList] = useState([]);
  const [classifyList, setClassifyList] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [appOptions, setAppOptions] = useState([]);
  const [gatherFlowOptions, setGatherFlowOptions] = useState([]);
  const [distributeFlowOptions, setDistributeFlowOptions] = useState([]);

  const targetParentId = useRef('');
  const [form] = Form.useForm();
  const formLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  };

  useEffect(() => {
    loadPersonJson();
    loadClassifyTree();
    loadAppsOptions();
  }, []);

  useEffect(() => {
    if (modalType) {
      init(modalType);
      setIsEdit(modalType === 'dataModelEdit');
    }
  }, [modalType]);

  useEffect(() => {
    modalType === 'add' && classifyId && form.setFieldsValue({ classifyId });
  }, [classifyId]);

  const init = type => {
    if (type === 'add') {
      getIdOpt({
        appId: 'ASSET',
        type: 'EM',
      }).then(res => {
        const { data } = res;
        form.setFieldsValue({
          id: data.serialNumber || '',
          tableName: currentItem.num ? `${currentItem.num}_` : '',
        });
      });
    } else if (type === 'dataModelEdit') {
      const { gatherFlowApplyId = '', gatherFlowIds = '', distributeFlowApplyId = '', distributeFlowIds = '' } = targetData;
      let gatherFlow = gatherFlowIds ? gatherFlowIds.split(',') : undefined;
      let distributeFlow = distributeFlowIds ? distributeFlowIds.split(',') : undefined;
      async function loadFlow(gatherFlowApplyId, distributeFlowApplyId) {
        await new Promise(resolve => loadFlowOptions(gatherFlowApplyId, 'gather', resolve));
        loadFlowOptions(distributeFlowApplyId, 'distribute');
      }
      loadFlow(gatherFlowApplyId, distributeFlowApplyId);
      form.setFieldsValue({ ...targetData, gatherFlowIds: gatherFlow, distributeFlowIds: distributeFlow });
    }
  };

  const loadClassifyTree = () => {
    getInfoClassifySelect().then(res => {
      const { state, data } = res.data;
      if (state && isArray(data)) {
        const list = loopClassify(data);
        setClassifyList(list);
      }
    });
  };

  const loopClassify = (data, parentId) => {
    const list = data.map(item => ({
      value: item.id,
      title: item.modelName,
      disabled: !item.leaf,
      parentId: parentId || item.id,
      children: item.children ? loopClassify(item.children, parentId || item.id) : undefined,
    }));
    return list;
  };

  const loadPersonJson = () => {
    getPersonJsonByDeptId().then(res => {
      const { state, data } = res;
      if (!state) {
        const newData = data.map(item => {
          if (item.isLeaf === false) {
            item.disabled = true;
          }
          return item;
        });
        setTreeList(newData);
      }
    });
  };

  const loadAppsOptions = () => {
    getAppsSelect().then(res => {
      const { state } = res.data;
      if (state !== false && isArray(res.data)) {
        const list = res.data.map(item => ({
          value: item.applicationId,
          label: item.applicationName,
        }));
        setAppOptions(list);
      }
    });
  };

  const loadFlowOptions = (id, type, resolve) => {
    if (id) {
       let action = type === 'gather' ? setGatherFlowOptions : setDistributeFlowOptions;
       getListFlow({ applicationId: id }).then(res => {
         const { state, data } = res.data;
         if (state) {
           action(data);
         }
         resolve && resolve();
       });
    } else {
      resolve && resolve();
    }
   
  };

  const loop = (data = []) => {
    return data.map(i => {
      let item = {
        title: i.label || i.modelName,
        value: i.value || i.id,
        selectable: !i.children,
      };
      i.tableName && (item.tableName = i.tableName);
      i.children && (item.children = loop(i.children));
      return item;
    });
  };

  const onSubmit = values => {
    const apiPost = modalType === 'add' ? addList : editList;
    let postData = {};
    Object.keys(values).forEach(function (key) {
      if (values[key] !== undefined) {
        let value = values[key];
        if (value instanceof Array) {
          postData[key] = value.join(','); //数组要转换为字符串提交
        } else {
          postData[key] = value;
        }
      }
    });
    postData.theirTopClassifyId = menuParentId;
    if (isEdit) {
      targetParentId.current && targetParentId.current !== menuParentId && (postData.theirTopClassifyId = targetParentId.current);
      postData = Object.assign({}, targetData, postData);
    }
    apiPost(postData).then(res => {
      const { state, data } = res.data;
      if (state) {
        showInfo('保存成功!');
      }
      handleCancel(null, true);
      form.resetFields();
    });
  };

  const onAppChange = (value, type) => {
    let action = type === 'gather' ? setGatherFlowOptions : setDistributeFlowOptions;
    let field = type === 'gather' ? 'gatherFlowIds' : 'distributeFlowIds';
    if (value) {
      loadFlowOptions(value, type);
    } else {
      action([]);
    }
    form.setFieldsValue({[field]: undefined})
  };

  const onClose = e => {
    handleCancel(e, false);
    form.resetFields();
  };

  const loadTreeData = treeNode => {
    const treeData = [...treeList];
    let curKey = treeNode.props.eventKey;
    const params = { deptCode: curKey };
    let i = 0;
    const loop = (curTreeData, newChildrenData) => {
      curTreeData.forEach(item => {
        if (curKey === item.key) {
          item.children = newChildrenData; //找到当前点击的节点后加入子节点数据进去
          return;
        } else if (item.children) {
          //没有找到时如果当前节点还子节点再往下找子节点
          loop(item.children, newChildrenData);
        }
      });
    };

    return new Promise(resolve => {
      getPersonJsonByDeptId({ ...params }).then(res => {
        const { data } = res;
        if (data.state === false) {
          showError('服务请求失败,请检查服务接口处于可用状态!');
        } else {
          let newData = data.map(item => {
            if (item.isLeaf === false) {
              item.disabled = true;
            }
            return item;
          });
          loop(treeData, newData);
          setTreeList(treeData);
        }
        resolve();
      });
    });
  };

  const handleClassifyChange = (value, node, extra) => {};

  return (
    <div className="new-modal-content">
      <Form form={form} onFinish={onSubmit} {...formLayout}>
        <Tabs size="large">
          <Tabs.TabPane key="appProps" tab="模型属性">
            <FormItem label="所属分类" name="classifyId" rules={[{ required: isEdit, message: '请选择分类!' }]} hidden={!isEdit}>
              <TreeSelect treeData={classifyList} dropdownStyle={{ maxHeight: 400, overflow: 'auto' }} placeholder="请选择分类" showSearch allowClear onSelect={handleClassifyChange} />
            </FormItem>
            <FormItem
              label="唯一id"
              name="id"
              hasFeedback
              help="唯一id如果已被引用修改id会引起其他设计的引用错误"
              hidden
              rules={[
                {
                  required: true,
                  message: '请输入id!',
                },
              ]}
            >
              <Input placeholder="模型id" />
            </FormItem>
            <FormItem label="模型编号" name="num" help="任意有意义的编号即可">
              <Input />
            </FormItem>
            <FormItem label="模型名称" name="tableName" help="对应数据库中的表名" rules={[{ required: true, message: '请输入名称!' }]}>
              <Input />
            </FormItem>
            <FormItem label="模型注释" name="modelName" help="任意中文注释描述" rules={[{ required: true, message: '请输入注释!' }]}>
              <Input />
            </FormItem>
            <FormItem
              label="数据量统计趋势"
              name="dataStatics"
              initialValue={true}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Radio.Group>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </FormItem>
            <FormItem label="状态" name="status" initialValue={1} rules={[{ required: true, message: '请选择状态!' }]}>
              <Radio.Group>
                <Radio value={1}>启用</Radio>
                <Radio value={2}>停用</Radio>
              </Radio.Group>
            </FormItem>
            <FormItem label="排序" name="sort" initialValue={1001} rules={[{ required: true, message: '请输入排序!' }]}>
              <InputNumber />
            </FormItem>
          </Tabs.TabPane>
          <Tabs.TabPane key="permission" tab="权限设置" forceRender>
            <FormItem label="查看权限" help="空表示所有用户，否则只有指定用户及管理员可以查看" name="viewPermission">
              <TreeSelect allowClear multiple placeholder="用户选择" treeData={treeList} loadData={loadTreeData} dropdownStyle={{ maxHeight: 300, overflow: 'auto' }} />
            </FormItem>
          </Tabs.TabPane>
          <Tabs.TabPane tab="采集流程" key="gatherFlowIds">
            <FormItem label="所属应用" help="" name="gatherFlowApplyId">
              <Select options={appOptions} onChange={value => onAppChange(value, 'gather')} allowClear />
            </FormItem>
            <FormItem label="关联流程" help="" name="gatherFlowIds">
              <Select mode="multiple" options={gatherFlowOptions} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
            </FormItem>
          </Tabs.TabPane>
          <Tabs.TabPane tab="分发流程" key="distributeIds">
            <FormItem label="所属应用" help="" name="distributeFlowApplyId">
              <Select options={appOptions} onChange={value => onAppChange(value, 'distribute')} allowClear />
            </FormItem>
            <FormItem label="关联流程" help="" name="distributeFlowIds">
              <Select mode="multiple" options={distributeFlowOptions} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
            </FormItem>
          </Tabs.TabPane>
        </Tabs>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Space>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
            <Button onClick={onClose}>关闭</Button>
          </Space>
        </FormItem>
      </Form>
    </div>
  );
}

export default NewDataModel;
