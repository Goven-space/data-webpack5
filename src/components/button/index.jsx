import React from 'react'
import { Button, Popconfirm } from "antd";
import Icon from "@components/icon";
import { deleteIcon } from "@/constant/icon.js";

export default function index(props) {
  return (
    <Popconfirm
      placement="top"
      title={props.text || "确认是否删除"}
      onConfirm={props.onClick}
      okText="是"
      cancelText="否"
    >
      <Button
        danger
        disabled={props.disabled}
        icon={<Icon type={deleteIcon} />}
      >
        删除
      </Button>
    </Popconfirm>
  );
}
