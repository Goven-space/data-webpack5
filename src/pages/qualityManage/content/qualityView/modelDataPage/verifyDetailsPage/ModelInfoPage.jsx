import React, { useState, useEffect, useRef } from 'react';
import { Table, Row, Col, Input, Tag } from 'antd';
import { qualityManageApi } from '@api/dataAccessApi';
import { isArray } from 'lodash';

const {Search} = Input

const { getModelRuleListDetail } = qualityManageApi.qualityView;

function ModelInfoPage(props) {
    const {dataModelId, batchTime} = props
    const [dataSource, setDataSource] = useState([])
    const [total, setTotal] = useState(0)

    const allDataSource = useRef()


    useEffect(() => {
      if (dataModelId && batchTime) {
        loadList();
      } else {
        setDataSource([]);
      }
    }, [dataModelId, batchTime]);

    const loadList = () => {
        const params = {
          dataModelId,
          batchTime,
        };
        getModelRuleListDetail(params).then(res => {
            const { state, data } = res.data;
            if (state && isArray(data)) {
              setDataSource(data);
              setTotal(data.length);
              allDataSource.current = data;
            } else {
              setDataSource([]);
              setTotal(0);
              allDataSource.current = [];
            }
        });
    }

     const columns = [
       {
         title: '核验质量规则名称',
         dataIndex: 'verifyQualityRuleName',
         ellipsis: true,
         width: '30%',
       },
       {
         title: '正常记录数',
         dataIndex: 'normalCount',
         width: '15%',
       },
       {
         title: '错误记录数',
         dataIndex: 'errorCount',
         width: '15%',
       },
       {
         title: '核验耗时',
         dataIndex: 'totalTimeConsuming',
         ellipsis: true,
         width: '15%',
       },
       {
         title: '核验是否通过',
         dataIndex: 'verifyFlag',
         width: '15%',
         render: text => (text ? <Tag color="green">是</Tag> : <Tag color="orange">否</Tag>),
       },
     ];
    
    const onSearch = (value) => {
        const searchFilters = value ? value.trim().toLowerCase() : '';
        const list = searchFilters
          ? allDataSource.current?.filter(item =>
              item.verifyQualityRuleName.toLowerCase().includes(searchFilters)
            )
          : [...allDataSource.current];
        setTotal(list.length);
        setDataSource(list);
    }
    
    return (
      <div>
        <Row style={{ marginBottom: 10 }}>
          <Col>
            <Search placeholder="核验质量规则名称" allowClear onSearch={onSearch} style={{ width: 250 }} />
          </Col>
        </Row>
        <Table
          rowKey={record => record.id}
          bordered
          size="small"
          columns={columns}
          dataSource={dataSource}
          pagination={{
            total,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    );
}

export default ModelInfoPage;