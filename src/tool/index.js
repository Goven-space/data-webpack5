import html2canvas from 'html2canvas';
import JsPDF from 'jspdf';
import { isObject, isNumber } from 'lodash';
import Icon from '@components/icon';
import { notification } from 'antd';
import ToolTip from '@components/textToolTip';
import * as XLSX from 'xlsx';

let environmentTip = '';
let targetType = '';

export const initTreeData = (data, key) => {
  /*
   * 此方法适用于将一维树数据转换为多层嵌套树数据;
   * data: 一维数据, 每一条数据应包含id, parentId, name;
   * key: 首层的parentId,用于过滤;
   * 使用方法 const treeData = initTreeData(data, 'root');
   * 经过initTreeData处理的数据可以直接在ant design <Tree /> 或 <TreeSelect />组件中使用
   */
  const arr = [];
  data.forEach(item => {
    if (item.parentId === key) {
      const children = data.findIndex(o => o.parentId === item.id);
      if (children >= 0) {
        item.children = [...initTreeData(data, item.id)];
      }
      arr.push({
        ...item,
        title: item.name,
        key: item.id,
      });
    }
  });
  return arr;
};

export const guid = () => {
  return Number(Math.random().toString().substr(3, 3) + Date.now()).toString(36);
};

//对拼接后的数组对象去重
export const duplicateRemoval = (data = [], flag) => {
  const hash = {};
  const arr = data.reduce(function (result, cur) {
    if (!hash[cur[flag]]) {
      hash[cur[flag]] = true && result.push(cur);
    }
    return result;
  }, []);
  return arr;
};

// 生成图片
export const onrendered = canvasImage => {
  canvasImage.id = 'mycanvas';
  //生成base64图片数据
  // 在state里面定义的是个空字符串
  const dataUrl = canvasImage.toDataURL();
  var newImage = document.createElement('img');
  newImage.src = dataUrl;
  // document.body.appendChild(newImage);
};

export const imagePdf = (id, name) => {
  // 这个是获取需要打印的pdf
  const canvasData = document.getElementById(id);
  html2canvas(canvasData).then(canvasImge => {
    // 这个是转为base64的代码
    /* onrendered(canvasImge); */
    let contentWidth = canvasImge.width;
    let contentHeight = canvasImge.height;
    let pageHeight = (contentWidth / 592.28) * 841.89;
    let leftHeight = contentHeight;
    let position = 0;
    let imgWidth = 595.28;
    let imgHeight = (592.28 / contentWidth) * contentHeight;
    let pageData = canvasImge.toDataURL('image/jpeg', 1.0);
    //   document.body.appendChild(canvasImge);
    let PDF = new JsPDF('', 'pt', 'a4');
    if (leftHeight < pageHeight) {
      PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
    } else {
      while (leftHeight > 0) {
        PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
        leftHeight -= pageHeight;
        position -= 841.89;
        if (leftHeight > 0) {
          PDF.addPage();
        }
      }
    }
    PDF.save(name + '.pdf');
  });
};

//生成颜色
export const color16 = () => {
  //十六进制颜色随机
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const color = '#' + r.toString(16) + g.toString(16) + b.toString(16);
  return color;
};

export const group = (array, subGroupLength) => {
  let index = 0;
  let newArray = [];
  while (index < array.length) {
    newArray.push(array.slice(index, (index += subGroupLength)));
  }
  return newArray;
};

export const getCookieValue = field => {
  const cook = document.cookie.split('; ');
  const cookieIndex = cook.findIndex(o => o.match(field) !== null);
  const fieldValue = cookieIndex >= 0 ? cook[cookieIndex].split('=')[1] : undefined;
  return fieldValue;
};

export const toTreeSelectData = data => {
  let resData = data;
  let tree = [];
  for (let i = 0; i < resData.length; i++) {
    //找首层PARENT_ID=root菜单
    if (resData[i].parentId === 'root') {
      let obj = {
        key: resData[i]['id'],
        name: resData[i]['name'],
        url: resData[i]['uri'],
        manager: resData[i]['manager'],
        createTime: resData[i]['createTime'],
        appName: resData[i]['appName'],
        remark: resData[i]['remark'],
        children: [],
      };
      tree.push(obj);
      //拼装一个就在未拼装的集合里面把数据删除，避免下次重复循环
      resData.splice(i, 1);
      i--;
    }
  }
  run(tree);
  //传入参数为父级菜单
  function run(chiArr) {
    //判断数组原本数据是否都拼装完了
    if (resData.length !== 0) {
      //循环父级菜单
      for (let i = 0; i < chiArr.length; i++) {
        //循环剩余需要组装的数据
        for (let j = 0; j < resData.length; j++) {
          //判断是否存在关系，存在就获取未拼装记录中的数据插入到父级的children字段的数组里

          if (chiArr[i].key === resData[j]['parentId']) {
            let obj = {
              key: resData[j]['id'],
              name: resData[j]['name'],
              url: resData[i]['uri'],
              manager: resData[i]['manager'],
              createTime: resData[i]['createTime'],
              appName: resData[i]['appName'],
              remark: resData[i]['remark'],
              children: [],
            };
            chiArr[i].children.push(obj);
            //拼装一个就在未拼装的集合里面把数据删除，避免下次重复循环
            resData.splice(j, 1);
            j--;
          }
        }
        run(chiArr[i].children);
      }
    }
  }
  return tree;
};

/*
 * 递归查找树结构数组并返回对应的item;
 * arr: 树数据;
 * childrenField: 子数据字段;
 * fieldName: 需要匹配的字段;
 * value: 匹配字段的值
 */
export const findArrayItem = (arr, childrenField, fieldName, value) => {
  let objItem;
  for (let i = 0, l = arr.length; i < l; i++) {
    if (arr[i][fieldName] === value) {
      objItem = arr[i];
      break;
    } else {
      if (arr[i][childrenField] && arr[i][childrenField].length) {
        objItem = findArrayItem(arr[i][childrenField], childrenField, fieldName, value);
        if (objItem !== undefined) {
          break;
        }
      }
    }
  }
  return objItem;
};

/*
 * 递归查找树结构数组并修改对应的item;
 * arr, childrenField, fieldName, value 与 findArrayItem 一致;
 * changeData: 需要修改的数据对象
 */
export const changeArrayItem = (arr, childrenField, fieldName, value, changeData) => {
  for (let i = 0, l = arr.length; i < l; i++) {
    if (arr[i][fieldName] === value) {
      arr[i] = { ...arr[i], ...changeData };
      break;
    } else {
      if (arr[i][childrenField] && arr[i][childrenField].length) {
        arr[i][childrenField] = changeArrayItem(
          arr[i][childrenField],
          childrenField,
          fieldName,
          value,
          changeData
        );
      }
    }
  }
  return arr;
};

// export const logout = (callback) => {
//   // 调用登出接口
//   let userName = getUsername();
//   let userId = getUserId();
//   new Promise((resolve, reject) => {
//     userLogout({ userName, userId }).then(res => {
//       callback()
//       resolve();
//     });
//   }).finally(res => {
//     clearAll();
//   });
// };

export const clearCookie = () => {
  var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
  if (keys) {
    for (var i = keys.length; i--; ) {
      document.cookie = keys[i] + '=0;path=/;expires=' + new Date(0).toUTCString(); //清除当前域名下的,例如：m.kevis.com
      document.cookie =
        keys[i] + '=0;path=/;domain=' + document.domain + ';expires=' + new Date(0).toUTCString(); //清除当前域名下的，例如 .m.kevis.com
      document.cookie = keys[i] + '=0;path=/;domain=kevis.com;expires=' + new Date(0).toUTCString(); //清除一级域名下的或指定的，例如 .kevis.com
    }
  }
};

export const getTreeSelectData = (arr = [], title, value, isParentDisabled = false, isConnect, extra) => {
  return arr.map(item => ({
    title: isConnect && !item.children ? `${item[title]}-${item[isConnect]}` : item[title],
    value: item[value],
    isLeaf: item.isLeaf,
    [extra]: extra ? item[extra] : undefined,
    disabled: isParentDisabled && item.children ? true : false,
    children: item.children?.length
      ? getTreeSelectData(item.children, title, value, isParentDisabled, isConnect, extra)
      : undefined,
  }));
};

export const jsonFormatting = json => {
  try {
    const isJson = isObject(JSON.parse(json));
    if (isJson) {
      return JSON.stringify(JSON.parse(json), null, 4);
    } else {
      return json;
    }
  } catch {
    return json;
  }
};

export const dealRoute = (currentRoute = '', routesList = []) => {
  let routeItem = {};
  routesList.some(item => {
    if (item.path === currentRoute) {
      routeItem = {
        ...item,
      };
      return routeItem;
    } else {
      if (item.routes && item.routes.length) {
        routeItem = {
          ...dealRoute(currentRoute, item.routes),
        };
      }
    }
  });
  return routeItem;
};

export const showError = msg => {
  let errorMsg = msg || '服务请求失败,请检查服务接口处于可用状态!';
  notification.error({
    message: '操作提示!',
    duration: 4,
    description: errorMsg,
  });
};

export const showInfo = msg => {
  notification.info({
    message: '操作提示!',
    duration: 4,
    description: msg,
  });
};

export const paginationConfig = (pageNo, total, pageSize, onChange, pageSizeOptions) => {
  return {
    current: pageNo,
    total,
    showSizeChanger: true,
    pageSize,
    pageSizeOptions: pageSizeOptions || [10, 20, 30, 100],
    showTotal: (total, range) => `共 ${total} 条`,
    onChange,
  };
};

export const getMenu = (menu = [], label = 'label', key = 'key', extraField = {}) => {
  return menu.map(i => {
    const item = {
      label: <ToolTip text={i[label]} />,
      key: i[key],
      icon: i.icon && <Icon type={i.icon} />,
    };
    if (isObject(extraField) && Object.keys(extraField).length) {
      for (let key in extraField) {
        item[extraField[key]] = i[key] || '';
      }
    }
    if (i.children?.length) {
      item.children = getMenu(i.children, label, key, extraField);
    }
    return item;
  });
};

export const getRootMenu = (arr = []) => {
  const newData = [];
  arr.forEach(item => {
    if (item.children) {
      newData.push(item.key);
    }
  });
  return newData;
};

export const getDefaultMenuPara = (arr = [], key = 'key', content = 'label') => {
  const rootSubmenuKeys = [];
  const defOpenMenu = [];
  let name = ''; //默认选中的defSelectKey可能需要拼接某个字段，所以将name返回去
  arr.forEach((item, index) => {
    rootSubmenuKeys.push(item[key]);
    if (index === 0) {
      defOpenMenu.push(item[key]);
      if (item.children && item.children.length) {
        name = getDefOpenMenu(item.children, key, defOpenMenu, content);
      } else {
        name = item[content];
      }
    }
  });
  return {
    rootSubmenuKeys,
    defOpenMenu,
    defSelectKey: defOpenMenu.length ? `${defOpenMenu[defOpenMenu.length - 1]}` : '',
    name,
  };
};

const getDefOpenMenu = (arr = [], key = 'key', data = [], content) => {
  let name = '';
  arr.forEach((item, index) => {
    if (index === 0) {
      data.push(item[key]);
      name = item[content];
      if (item.children && item.children.length) {
        name = getDefOpenMenu(item.children, key, data, content);
      }
    }
  });
  return name;
};

export function randomString(e) {
  e = e || 32;
  var t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678',
    a = t.length,
    n = '';
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n;
}

// const getSearchData = (arr = [], value) => {
// 	return arr.filter((item) => {
// 		if (item.name.includes(value)) {
// 			return true;
// 		} else {
// 			if (item.children && item.children.length) {
// 				const newC = getSearchData(item.children, value);
// 				item.children = newC;
// 				if (newC?.length) {
// 					return true;
// 				}
// 			}
// 		}
// 	});
// };

export const searchTreeData = (treeData = [], value) => {
  return treeData.filter(item => {
    if (item.name.includes(value)) {
      return true;
    } else {
      if (item.children && item.children.length) {
        const newC = searchTreeData(item.children, value);
        item.children = newC;
        if (newC?.length) {
          return true;
        }
      }
    }
  });
};

// json转Excel
export const json2Excel = (data, sheetName = 'sheet1', fileName = 'json2Excel.xlsx', excelKeyToName) => {
  if (isObject(excelKeyToName)) {
    data = data.map(item => {
      const newItem = {};
      Object.keys(item).forEach(key => {
        newItem[excelKeyToName[key]] = item[key];
      });
      return newItem;
    });
  }
  const jsonWorkSheet = XLSX.utils.json_to_sheet(data);
  const workBook = {
    SheetNames: [sheetName], // 指定有序 sheet 的 name
    Sheets: {
      [sheetName]: jsonWorkSheet, // 表格数据内容
    },
  };

  return XLSX.writeFile(workBook, fileName); // 向文件系统写出文件
};

export function addServerHost(serverHost) {
  //追加服务器
  let serverList = getServerList() || '';
  if (serverList.indexOf(serverHost) != -1) {
    return;
  } //说明已存在直接退出
  let serverListArray = serverList ? serverList.split(',') : [];
  if (serverListArray.length > 10) {
    serverListArray.shift();
  }
  serverListArray.push(serverHost);
  localStorage.setItem('serverHost', serverListArray.join(','));
}

export function setCurrentServerHost(serverHost) {
  // 设置当前服务器
  localStorage.setItem('currentServerHost', serverHost);
}

export function getCurrentServerHost() {
  // 获取当前服务器
  return localStorage.getItem('currentServerHost');
}

export function getServerList() {
  //获取服务器列表
  return localStorage.getItem('serverHost');
}

export const getConfigData = init => {
  let data = localStorage.getItem('configData');
  if (data && data !== 'undefined') {
    if (init) {
      document.title = JSON.parse(data).title || 'RestCloud iPaaS混合集成平台';
    }
    return JSON.parse(data);
  } else {
    return {};
  }
};

export const changeIcon = (src = '') => {
  let data = getConfigData();
  let titleIcon = data['titleIcon'];
  if (titleIcon && !src) {
    titleIcon = titleIcon;
  }
  var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = src; //icon图标
  document.getElementsByTagName('head')[0].appendChild(link);
};

export const getUrlSearch = (field, search) => {
  const url = search ? search.replace('?', '') : window.location.search.replace('?', '');
  const params = url.split('&');
  const item = params.filter(o => o.match(`${field}=`) !== null);
  if (item.length) {
    return item[0].replace(`${field}=`, '');
  } else {
    return undefined;
  }
};

export const findTreeData = (treeList, key) => {
  let data;
  (treeList || []).map(i => {
    if (i.value === key) {
      data = [i];
    } else {
      const child = findTreeData(i.children, key);
      if (child) {
        data = child;
      }
    }
  });
  return data;
};

// 大数值单位转换万、亿单位
export const numUnitConversion = (val, fixed = 0, hasZero = false) => {
  if (isNumber(val)) {
    let num = 10000;
    var sizesValue = '';
    if (val < 10000) {
      // 如果小于1000则直接返回
      sizesValue = '';
      return val;
    } else if (val >= 10000 && val < 99999999) {
      sizesValue = '万';
    } else if (val >= 100000000) {
      sizesValue = '亿';
    }
    let i = Math.floor(Math.log(val) / Math.log(num));
    var sizes = (val / Math.pow(num, i)).toFixed(fixed);
    if (!hasZero) {
      sizes = sizes.replace(/\.?0+$/, '');
    }
    sizes = sizes + sizesValue;
    // let remainder = val % Math.pow(num, i)
    // if (fixed === 0 && remainder ) {
    //   sizes = sizes + numUnitConversion(remainder, fixed);
    // }
      return sizes;
  }
  return 0;
};
