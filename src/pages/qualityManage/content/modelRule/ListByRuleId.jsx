import React, {useState, useEffect, useRef} from 'react';
import {
  Table,
  Button,
  Modal,
  Input,
  Row,
  Col,
  Tag,
  Divider,
  Badge,
  Tabs,
  Tooltip,
  Popover,
} from 'antd';
import { paginationConfig, showInfo } from '@tool/';
import { qualityManageApi } from '@api/dataAccessApi';

const { getReferenceRuleModel } = qualityManageApi.qualityRule;

const Search = Input.Search;

export default function ListByRuleId(props) {
  const { id } = props;
  
  const [rowsData, setRowsData] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    id && loadData()
  }, [id]);

  const loadData = (pagination = { current, pageSize }) => {
    const { current, pageSize } = pagination;
    const params = {
      pageNo: current,
      pageSize,
      id,
    };
    getReferenceRuleModel(params).then(res => {
      const { state, rows, pageNo, pageSize, total } = res.data;
      if (state) {
        setRowsData(rows);
        setCurrent(pageNo);
        setPageSize(pageSize);
        setTotal(total);
      }
    });
  };

  const refresh = () => {
    loadData({current: 1, pageSize})
  };

  const  onPageChange = (pagination, filters, sorter) => {
      loadData(pagination);
  };
  
  const columns = [
    {
      title: '系统名称',
      dataIndex: 'systemName',
      width: '20%',
    },
    {
      title: '引用模型名称',
      dataIndex: 'dataModelName',
      width: '20%',
    },
  ];

  return (
    <div>
      <Row style={{ marginBottom: 5 }} justify="space-between">
        <Col>
          <Button type="primary" onClick={refresh}>
            刷新
          </Button>
        </Col>
        <Col></Col>
      </Row>
      <Table
        size="small"
        bordered
        rowKey={record => record.id}
        dataSource={rowsData}
        columns={columns}
        onChange={onPageChange}
        pagination={paginationConfig(current, total, pageSize)}
      />
    </div>
  );
}

// class ListByRuleId extends React.Component {
//   constructor(props) {
//     super(props);
//     this.ruleId = this.props.ruleId;
//     this.url = LIST_URL + '?ruleId=' + this.ruleId;
//     this.state = {
//       pagination: { ...URI.PUBLIC.publicPagination },
//       selectedRowKeys: [],
//       selectedRows: [],
//       rowsData: [],
//       loading: true,
//       collapsed: false,
//     };
//   }

//   componentDidMount() {
//     this.loadData();
//   }

//   onSelectChange = (selectedRowKeys, selectedRows) => {
//     this.setState({ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
//   };

//   onPageChange = (pagination, filters, sorter) => {
//     this.setState({ pagination });
//   };

//   refresh = e => {
//     e.preventDefault();
//     this.loadData();
//   };

//   //通过ajax远程载入数据
//   loadData = (pagination = this.state.pagination, filters = {}, sorter = {}) => {
//     GridActions.loadData(this, this.url, pagination, filters, sorter);
//   };

//   render() {
//     const rowSelection = { selectedRowKeys: this.state.selectedRowKeys, onChange: this.onSelectChange };
//     const { rowsData, pagination, selectedRowKeys, loading, currentId, currentRecord } = this.state;
//     const hasSelected = selectedRowKeys.length > 0;
//     const divStyle = { marginTop: '8px', marginBottom: '8px' };
//     const columns = [
//       {
//         title: '流程名称',
//         dataIndex: 'processName',
//         width: '25%',
//       },
//       {
//         title: '引用节点名称',
//         dataIndex: 'pNodeName',
//         width: '25%',
//       },
//       {
//         title: '引用节点Id',
//         dataIndex: 'pNodeId',
//         width: '15%',
//       },
//       {
//         title: '创建者',
//         dataIndex: 'creator',
//         width: '15%',
//       },
//       {
//         title: '最后更新',
//         dataIndex: 'editTime',
//         width: '20%',
//       },
//     ];

//     return (
      // <div>
      //   <Row style={{ marginBottom: 5 }} gutter={0}>
      //     <Col span={12}>
      //       <Button type="primary" onClick={this.refresh} icon="reload" loading={loading}>
      //         刷新
      //       </Button>
      //     </Col>
      //     <Col span={12}></Col>
      //   </Row>
      //   <Table
      //     bordered={false}
      //     rowKey={record => record.id}
      //     dataSource={rowsData}
      //     columns={columns}
      //     loading={loading}
      //     onChange={this.onPageChange}
      //     pagination={pagination}
      //   />
      // </div>
//     );
//   }
// }

// export default ListProcessByRuleId;
