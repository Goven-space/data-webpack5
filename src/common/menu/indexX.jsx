import { baseMenuTree } from '@api/apiManager';
import Icon from '@components/icon';
import { Menu } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';

const MenuList = (props) => {
    const [routesList, setRoutesList] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([])
    let location = useLocation();

    useEffect(() => {
        if (sessionStorage.getItem('identitytoken')) {
            baseMenuTree().then((res) => {
                setRoutesList(res.data)
            })
        }
    }, [location])

    useEffect(() => {
        const index = routesList.findIndex(o => location.pathname.match(o.url) !== null)
        if(index > -1){
            if(routesList[index].children && routesList[index].children.length){
                const cIndex = routesList[index].children.findIndex(o => location.pathname.match(o.url) !== null)
                setSelectedKeys([routesList[index].children[cIndex].url])
            }else{
                setSelectedKeys([routesList[index].url])
            }
        } else {
            if(location.pathname.match('/admin/ApiDocumentPage') !== null){
                setSelectedKeys(['/admin/apiManager'])
            } else if (location.pathname.match('/admin/searchPage') !== null){
                setSelectedKeys(['/admin/apiManager'])
            }
            else {
                setSelectedKeys(['/admin/deliveryHome'])
            }
        }
    }, [routesList])

    const menuhandleClick = (e,a) => {
        props.onHandleSearch('')
    }



    return (
        <Menu theme="dark" mode="horizontal" selectedKeys={selectedKeys} style={{ marginLeft: 18, width: "85%", lineHeight: 4 }} onClick={menuhandleClick} >
            {
                routesList.map(item => {
                    if (item.children) {
                        return (
                            <Menu.SubMenu key={item.url} title={item.menuName} icon={item.icon && <Icon type={item.icon} />}>
                                {
                                    item.children.map(item => {
                                        return (
                                            <Menu.Item key={item.url} icon={item.icon && <Icon type={item.icon} />}>
                                                <Link to={item.url} >{item.menuName}</Link>
                                            </Menu.Item>
                                        )
                                    })
                                }
                            </Menu.SubMenu>
                        )
                    } else {
                        if (item.show !== false) {
                            return (
                                <Menu.Item key={item.url} icon={item.icon && <Icon type={item.icon} />}>
                                    <Link to={item.url} >{item.menuName}</Link>
                                </Menu.Item>
                            )
                        } else {
                            return false
                        }
                    }
                })
            }
        </Menu>
    )
}

export default MenuList