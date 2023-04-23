import { useEffect, useState } from "react";
import { getPersonJson } from "@api/apiManager";
import { TreeSelect } from "antd";
import { showError } from "@tool";

const UserAsynTreeSelect = (props) => {
  const [approverUserTreeData, setApproverUserTreeData] = useState([]);

  useEffect(() => {
    getInitApproverUserTreeData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getInitApproverUserTreeData = async () => {
    await getPersonJson({}).then((res) => {
      if (res.data) {
        res.data.forEach((item) => {
          if (!item.isLeaf) {
            item.disabled = true;
          }
        });
        setApproverUserTreeData(res.data);
      }
    });
  };

  const onLoadData = (treeNode) => {
    const treeData = [...approverUserTreeData];
    let curKey = treeNode.key;
    const loop = (curTreeData, newChildrenData) => {
      curTreeData.forEach((item) => {
        if (curKey === item.key) {
          item.children = newChildrenData; //找到当前点击的节点后加入子节点数据进去
          return;
        } else if (item.children) {
          //没有找到时如果当前节点还子节点再往下找子节点
          loop(item.children, newChildrenData);
        }
      });
    };

    return new Promise((resolve) => {
      getPersonJson({ deptCode: curKey }).then((res) => {
        if (res.data) {
          res.data.forEach((item) => {
            if (!item.isLeaf) {
              item.disabled = true;
            }
          });
          loop(treeData, res.data);
          setApproverUserTreeData(treeData);
        } else {
          showError.error(res.data.msg);
        }
        resolve();
      });
    });
  };

  const onApproverUserTreeDataChange = (value) => {
    if (props.onChange) {
      props.onChange(value);
    } else {
    }
  };

  return (
    <TreeSelect
      {...(props.options || {})}
      treeData={approverUserTreeData}
      placeholder="请选择"
      onChange={onApproverUserTreeDataChange}
      loadData={onLoadData}
      allowClear
      value={props.value}
    ></TreeSelect>
  );
};
export default UserAsynTreeSelect;
