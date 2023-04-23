
export const getComponents = pathname => {
  const routePath = pathname.split('/')?.filter(item => item)[0] || '';
  // 建立上下文件关系
  let files = {};
  const special = []; //有些侧边栏存在复用的，在这里特殊处理
  switch (routePath) {
    case 'home':
      files = require.context('../../pages/home/', true, /\index.jsx$/); // 第一个参数：目录，第二参数：是否查找子级目录，第三参数：指定查找到文件
      break;
    case 'masterDataModeling':
      files = require.context('../../pages/masterDataModeling/content/', true, /\index.jsx$/);
      break;
    case 'metadataManage':
      files = require.context('../../pages/metadataManage/content/', true, /\index.jsx$/);
      break;
    case 'manageMonitor':
      files = require.context('../../pages/manageMonitor/content/', true, /\index.jsx$/);
      break;
    case 'masterDataMaintenance':
      files = require.context('../../pages/masterDataMaintenance', true, /\index.jsx$/);
      break;
    case 'masterDataView':
      files = require.context('../../pages/masterDataView', true, /\index.jsx$/);
      break;
    case 'qualityManage':
      files = require.context('../../pages/qualityManage/content/', true, /\index.jsx$/);
      break;
    default:
      files = require.context('../../pages/', false, /\.jsx$/);
      break;
  }
  // 声明组件对象
  const components = [];
  
  // 循环文件
  files.keys().forEach(key => {
    // 过滤 index、login

    if (key.includes('./index/') || key.includes('./login/')) {
      return false;
    }

    // 分割字符串
    const splitFilesName = key.split('/');
    const jsonObj = {};
    // path
    // const path = `/${routePath}/${splitFilesName[1]}`;
    // component
    const component = files(key).default;

    // 写入对象
    if (splitFilesName[1]?.includes('index')){
      jsonObj.path = `/${routePath}`;
      jsonObj.menuKey = routePath
    } else {
      jsonObj.path = `/${routePath}/${splitFilesName[1]}`;
      jsonObj.menuKey = splitFilesName[1];
    }
    jsonObj.component = component;
    components.push(jsonObj);
  });
  return components.concat(special);
};

/* export default components; */
