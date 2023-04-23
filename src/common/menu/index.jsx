import React,{useEffect, useState} from 'react'
import { Menu } from 'antd'
import {getMenu} from '@/tool'

export default function Index(props) {
	const { leftWidth, defOpenKeys, LeftMenu } = props;
	
  const [openKeys, setOpenKeys] = useState(defOpenKeys || []);
  const [menuItems, setMenuItems] = useState([])
  
  useEffect(() => {
    const items = getMenu(LeftMenu);
    setMenuItems(items);
  }, [])

	const selectedKeys = () => {
		
	}
	const onClick = () => {
		
	}

	const onOpenChange = () => {
		
	}

	const getMenu = () => {
		
	}

	return (
    <Menu
      inlineIndent={15}
      trigger={null}
      mode="inline"
      width={leftWidth}
      className="side-menu"
      openKeys={openKeys}
      selectedKeys={selectedKeys}
      onClick={onClick}
      onOpenChange={onOpenChange}
      items={menuItems}
    />
  );
}
