// import { topMenu, leftMenu } from './constant/menu';
// import Login from '@pages/login';
// import Home from '@pages/home';
// //标准管理
// import MasterDataModeling from '@pages/masterDataModeling';
// import MetadataManage from '@pages/metadataManage';
// import StatisticalAnalysis from '@pages/statisticalAnalysis';

// const routesList = [
//   {
//     path: '/statisticalAnalysis',
//     name: '统计分析',
//     key: 'statisticalAnalysis',
//     component: StatisticalAnalysis,
//   },
//   {
//     path: '/masterDataModeling',
//     name: '主数据建模',
//     key: 'masterDataModeling',
//     component: MasterDataModeling,
//     routes: [
//       {
//         path: '/masterDataModeling/fieldManage',
//         key: 'fieldManage',
//         name: '字段管理',
//         icon: 'SettingOutlined',
//         breadcrumb: '主数据建模 > 字段管理',
//       },
//       {
//         path: '/masterDataModeling/normCode',
//         name: '代码集管理',
//         key: 'normCode',
//         breadcrumb: '主数据建模 > 代码集管理',
//         icon: 'PicCenterOutlined',
//       },
//       {
//         path: '/masterDataModeling/logicalModel',
//         name: '逻辑模型',
//         key: 'logicalModel',
//         breadcrumb: '主数据建模 > 逻辑模型',
//         icon: 'BorderOuterOutlined',
//       },
//       {
//         path: '/masterDataModeling/physicalModel',
//         name: '物理模型',
//         key: 'physicalModel',
//         breadcrumb: '主数据建模 > 物理模型',
//         icon: 'PicRightOutlined',
//       },
//       {
//         path: '/masterDataModeling/normDataMaintenance',
//         name: '数据维护',
//         key: 'normDataMaintenance',
//         breadcrumb: '主数据建模 > 数据维护',
//         icon: 'PicRightOutlined',
//       },
//     ],
//   },
//   {
//     path: '/metadataManage',
//     name: '元数据管理',
//     key: 'metadataManage',
//     component: MetadataManage,
//     routes: [
//       {
//         path: '/metadataManage/metadataLinkConfig',
//         key: 'metadataLinkConfig',
//         name: '链接配置',
//         icon: 'SettingOutlined',
//         breadcrumb: '元数据管理 > 链接配置',
//       },
//       {
//         path: '/metadataManage/metadataGather',
//         name: '元数据采集',
//         key: 'metadataGather',
//         breadcrumb: '元数据管理 > 元数据采集',
//         icon: 'PicCenterOutlined',
//       },
//       {
//         path: '/metadataManage/metadataLabelSet',
//         name: '元数据标签',
//         key: 'metadataLabelSet',
//         breadcrumb: '元数据管理 > 元数据标签',
//         icon: 'BorderOuterOutlined',
//       },
//       {
//         path: '/metadataManage/ODSLibraryModeling',
//         name: 'ODS库建模',
//         key: 'ODSLibraryModeling',
//         breadcrumb: '元数据管理 > ODS库建模',
//         icon: 'PicRightOutlined',
//       },
//     ],
//   },
//   {
//     key: 'manageMonitor',
//     name: '管理监控',
//     routes: [
//       {
//         path: '/manageMonitor/configFileServer',
//         key: 'configFileServer',
//         name: '文件服务',
//         icon: 'FundViewOutlined',
//         breadcrumb: '管理监控  > 文件服务',
//       },
//       {
//         path: '/manageMonitor/databaseManage',
//         key: 'databaseManage',
//         name: '数据库管理',
//         icon: 'FundViewOutlined',
//         breadcrumb: '管理监控  > 数据库管理',
//         routes: [
//           {
//             path: '/manageMonitor/oracleTablespace',
//             key: 'oracleTablespace',
//             name: 'Oracle表空间',
//             icon: 'FundViewOutlined',
//             breadcrumb: '管理监控  >  Oracle表空间',
//           },
//           {
//             path: '/manageMonitor/oracleUserManager',
//             key: 'oracleUserManager',
//             name: 'Oracle用户管理',
//             icon: 'FundViewOutlined',
//             breadcrumb: '管理监控  >  Oracle用户管理',
//           },
//         ],
//       },
//       {
//         path: '/manageMonitor/databaseMonitoring',
//         key: 'databaseMonitoring',
//         name: '数据库监控',
//         icon: 'FundViewOutlined',
//         topMenu: topMenu['home'],
//         breadcrumb: '管理监控  > 数据库监控',
//         routes: [
//           {
//             path: '/manageMonitor/oracleMonitoring',
//             key: 'oracleMonitoring',
//             name: 'Oracle监控',
//             icon: 'FundViewOutlined',
//             breadcrumb: '管理监控  >  Oracle监控',
//           },
//         ],
//       },
//     ],
//   },
//   {
//     key: 'masterDataView',
//     name: '主数据查看',
//     path: '/masterDataView',
//   },
//   {
//     key: 'masterDataMaintenance',
//     name: '主数据维护',
//     routes: [
//       {
//         path: '/masterDataMaintenance/masterDataCategory',
//         key: 'masterDataCategory',
//         name: '主数据分类',
//         icon: 'FundViewOutlined',
//         breadcrumb: '主数据维护  > 主数据分类',
//       },
//       {
//         path: '/masterDataMaintenance/masterDataManage',
//         key: 'masterDataManage',
//         name: '主数据管理',
//         icon: 'FundViewOutlined',
//         breadcrumb: '主数据维护  > 主数据管理',
//       },
//     ],
//   },
//   {
//     path: '/qualityManage',
//     name: '质量管理',
//     key: 'qualityManage',
//     routes: [
//       {
//         path: '/qualityManage/qualityMonitor',
//         key: 'qualityMonitor',
//         name: '质量监控',
//         icon: 'SettingOutlined',
//         breadcrumb: '质量管理 > 质量监控',
//       },
//       {
//         path: '/qualityManage/qualityView',
//         name: '质量查看',
//         key: 'qualityView',
//         breadcrumb: '质量管理 > 质量查看',
//         icon: 'PicCenterOutlined',
//       },
//       {
//         path: '/qualityManage/qualityVerification',
//         name: '质量核验',
//         key: 'qualityVerification',
//         breadcrumb: '质量管理 > 质量核验',
//         icon: 'BorderOuterOutlined',
//       },
//       {
//         path: '/qualityManage/qualityRule',
//         name: '质量规则',
//         key: 'qualityRule',
//         breadcrumb: '质量管理 > 质量规则',
//         icon: 'PicRightOutlined',
//       },
//       {
//         path: '/qualityManage/ruleConfig',
//         name: '质量规则配置',
//         key: 'ruleConfig',
//         breadcrumb: '质量管理 > 质量规则配置',
//         icon: 'PicRightOutlined',
//       },
//     ],
//   },
// ];

// export default routesList;
