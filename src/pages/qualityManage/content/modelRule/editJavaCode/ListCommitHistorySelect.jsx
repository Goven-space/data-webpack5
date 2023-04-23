import React, { useEffect, useState, useRef } from 'react';
import { Table, Card, Menu, Dropdown, Popconfirm, Button, Modal, Input, Row, Col, Space } from 'antd';
import { qualityManageApi } from '@api/dataAccessApi';
import { paginationConfig, showInfo } from '@tool/';
// import { getCurrentTransform } from 'pdfjs-dist/types/src/display/display_utils';

const Search = Input.Search;

const { getHistoryList } = qualityManageApi.qualityRule;

//模板代码代码选择时使用

export default function ListCommitHistorySelect(props) {
  const { closeDialog, configId } = props;

  const [rowsData, setRowsData] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const sorterValue = useRef();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = (pagination = { current, pageSize }) => {
    const { current, pageSize } = pagination;
    const params = {
      configId,
      pageNo: current,
      pageSize,
      ...sorterValue.current,
    };
    getHistoryList(params).then(res => {
      const { state, rows, pageNo, pageSize, total } = res.data;
      if (state) {
        setRowsData(rows);
        setCurrent(pageNo);
        setPageSize(pageSize);
        setTotal(total);
      }
    });
  };

  const onSelectOk = () => {
    closeDialog(selectedRowKeys[0]);
  }

  const refresh = () => {
    loadData({current: 1, pageSize})
  };

  const onPageChange = (pagination, filters, sorter) => {
    sorterValue.current = sorter.order
      ? {
          sort: sorter.field,
          order: sorter.order === 'ascend' ? 'ASC' : 'DESC',
        }
      : { sort: '', order: '' };
    loadData(pagination);
  };

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
  };

  const expandedRow = record => {
    return <Input.TextArea autoSize={{ minRows: 2, maxRows: 12 }} value={record[record.commitCodeField]} />;
  };

  const columns = [
    {
      title: '唯一Id',
      dataIndex: 'commitConfigId',
      width: '40%',
      sorter: true,
    },
    {
      title: '提交人',
      dataIndex: 'commitUserId',
      width: '30%',
    },
    {
      title: '提交时间',
      dataIndex: 'commitDateTime',
      width: '30%',
    },
  ];

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 5 }}>
        <Col>
          <Space>
            <Button type="primary" onClick={onSelectOk} disabled={selectedRowKeys.length !== 1}>
              恢复到选中记录
            </Button>
            <Button type="ghost" onClick={refresh}>
              刷新
            </Button>
            <Button onClick={closeDialog}>关闭</Button>
          </Space>
        </Col>
        <Col>
          <Search
            style={{ width: 260 }}
            placeholder="提交人或提交时间"
            onChange={e => {
              this.searchKeyword = e.target.value;
            }}
            onSearch={value => this.search(value)}
          />
        </Col>
      </Row>
      <Table
        size="small"
        rowKey={record => record.id}
        dataSource={rowsData}
        columns={columns}
        rowSelection={{ selectedRowKeys, onChange: onSelectChange, type: 'radio' }}
        onChange={onPageChange}
        pagination={paginationConfig(current, total, pageSize)}
        expandedRowRender={expandedRow}
      />
    </div>
  );
}

// class ListCommitHistorySelect extends React.Component {
//   constructor(props) {
//     super(props);
//     this.configId=this.props.configId;
//     this.close=this.props.close;
//     this.url=LIST_URL+"?configId="+this.configId;
//     this.searchFilters = {};
//     this.sorter = {};
//     this.defaultPagination = {...URI.PUBLIC.publicPagination}
//     this.state={
//       pagination:{...this.defaultPagination},
//       selectedRowKeys:[],
//       selectedRows:[],
//       rowsData: [],
//       departmentCode:'',
//       loading: true,
//       visible:false,
//       currentId:'',
//       action:'edit',
//     }
//   }

//   componentDidMount(){
//       this.loadData();
//   }

//   onSelectChange = (selectedRowKeys,selectedRows) => {
//    this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
//   }

//   onPageChange=(pagination, filters, sorter)=>{
//     this.sorter = sorter.order ? {'order':sorter.order,'field':sorter.field} : {};
//     this.loadData(pagination);
//   }

//   refresh=(e)=>{
//     e.preventDefault();
//     this.searchFilters = {}
//     this.loadData();
//   }

//   //通过ajax远程载入数据
//   loadData=(pagination=this.state.pagination)=>{
//     const filters = {}
//     GridActions.loadData(this,this.url,pagination,filters,this.sorter,this.searchFilters);
//   }

//   //通过ajax远程载入数据
//   search=(value)=>{
//     this.searchFilters=value ? {"commitUserId":value,"commitDateTime":value} : {};
//     this.loadData(this.defaultPagination)
//   }

//   onSelectOk=()=>{
//     this.close(this.state.selectedRowKeys);
//   }

//   render(){
//     const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange, type:'radio'};
//     const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
//     const hasSelected = selectedRowKeys.length === 1;
//     const divStyle ={marginTop: '8px',marginBottom: '8px',}
//     const columns=[{
//         title: '唯一Id',
//         dataIndex: 'commitConfigId',
//         width: '40%',
//         sorter:true,
//       },{
//         title: '提交人',
//         dataIndex: 'commitUserId',
//         width: '30%'
//       },{
//         title: '提交时间',
//         dataIndex: 'commitDateTime',
//         width: '30%'
//       }];

//       const expandedRow=(record)=>{
//         return (
//             <Input.TextArea autoSize={{ minRows: 2, maxRows: 12 }} value={record[record.commitCodeField]} />
//           );
//       }

//     return (
// <div>
//       <Row style={{marginBottom:5}} gutter={0} >
//         <Col span={12} >
//           <Button  type="primary" onClick={this.onSelectOk} disabled={!hasSelected} icon="check"  >恢复到选中记录</Button>{' '}
//           <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
//           <Button onClick={this.close.bind(this,"")}  >关闭</Button>
//         </Col>
//         <Col span={12}>
//          <span style={{float:'right'}} >
//            <span className='table-search-label'>搜索</span><Search
//             style={{ width: 260 }}
//             placeholder='提交人或提交时间'
//             onChange={e=>{this.searchKeyword=e.target.value}}
//             onSearch={value => this.search(value)}
//           />
//            </span>
//         </Col>
//       </Row>
//       <Table
//         size='small'
//         bordered={false}
//         rowKey={record => record.id}
//         dataSource={rowsData}
//         columns={columns}
//         rowSelection={rowSelection}
//         loading={loading}
//         onChange={this.onPageChange}
//         pagination={pagination}
//         expandedRowRender={expandedRow}
//       />
// </div>
//     );
//   }
// }

// export default ListCommitHistorySelect;
