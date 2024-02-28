import {
  deleteChartUsingPost,
  listMyChartByPageUsingPost,
  regenerateChartUsingGet,
} from '@/services/mybi/chartController';
import { useModel } from '@umijs/max';
import { Avatar, Button, Card, message, Result, Space, Tag, Typography } from 'antd';
import Search from 'antd/es/input/Search';
import { List } from 'antd/lib';
import ReactEChart from 'echarts-for-react';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

const { Text, Link } = Typography;
const ManageChart: React.FC = () => {
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',
  };
  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  const [chartList, setChartList] = useState<API.ChartForMongo[]>();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  //登陆状态
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPost(searchParams);
      if (res.code === 0) {
        setTotal(res.data?.totalElements ?? 0);
        //隐藏图表的title，使得展现整齐一些(因为有的有title，有的没有)
        if (res.data?.content) {
          res.data.content.forEach((data: any) => {
            let status = data.status;
            let chartOption = undefined;
            if (status === 2) {
              try {
                chartOption = JSON.parse(data.genChart ?? '{}');
              } catch (error: any) {
                message.warning( '图表' + data.name + '解析失败，请您重新生成~~');
                // regenerateChartUsingGet({chartId:data.chartId});
                return;
              }
              chartOption.title = undefined;
              data.color = 'green';
            } else if (status === 0) {
              data.color = 'blue';
            } else if (status === 1) {
              data.color = 'orange';
            } else {
              data.color = 'red';
            }
          });
        }
        setChartList(res.data?.content ?? []);
      } else {
        message.error('获取所有图表失败!' + res.message);
      }
    } catch (e: any) {
      message.error('获取所有图表失败!' + e.message);
    }
    setLoading(false);
  };
  //检测，时刻获取数据
  useEffect(() => {
    loadData();
  }, [searchParams]);

  const handleDeleteChart = async (chartId: any, name: any) => {
    const res = await deleteChartUsingPost({ id: chartId });
    if (res.code === 0) {
      message.success('删除图表' + name + '成功');
    }
    // 删除完成后调用setRefreshData来刷新页面数据
    loadData();
  };

  const handleReGen = async (chartId: any) => {
    console.log(chartId);
    const res = await regenerateChartUsingGet({ chartId: chartId });
    if (res?.code === 0) {
      message.success('重试成功!请稍等~');
    }
  };

  function isValidJson(jsonString: any) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e:any) {
      message.error(e.message);
      return false;
    }
  }

  return (
    <div className="addChart">
      <Search
        placeholder={'请输入图表名'}
        enterButton
        loading={loading}
        onSearch={(value, event, info) => {
          setSearchParams({
            //如果用户在第二页搜索，获取到的数据应放在第一页展示，因此这里设置为initialState
            ...initialState,
            name: value,
          });
        }}
      />
      <div style={{ marginBottom: 16 }} />

      <List
        loading={loading}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize: pageSize,
            });
          },
          pageSize: searchParams.pageSize,
          current: searchParams.current,
          total: total,
        }}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            extra={item.createTime ? moment(item.createTime).format('YYYY-MM-DD') : ''}
          >
            <Card>
              <List.Item.Meta
                avatar={<Avatar src={currentUser?.userAvatar ?? undefined} />}
                title={
                  <Space>
                    {item.name} <Tag color={item?.color}>{item.message}</Tag>
                    <Button danger onClick={() => handleDeleteChart(item.chartId, item.name)}>
                      删除
                    </Button>
                    <Button type={'dashed'} onClick={() => handleReGen(item.chartId)}>
                      重新生成
                    </Button>
                  </Space>
                }
                description={item.charType ? '图表类型: ' + item.charType : undefined}
              />

              <>
                {item.status === 0 && (
                  <>
                    <div style={{ marginBottom: 16 }} />
                    <Text strong>{'分析目标: ' + item.goal}</Text>
                    <Result
                      status="warning"
                      title="图表待生成..."
                      subTitle={item.message ?? '当前图表生成队列繁忙，请耐心等候'}
                    />
                    <div style={{ marginBottom: 47 }} />
                  </>
                )}
                {item.status === 1 && (
                  <>
                    <div style={{ marginBottom: 16 }} />
                    <Text strong>{'分析目标: ' + item.goal}</Text>
                    <Result status="info" title="图标生成中..." subTitle={item.message} />
                    <div style={{ marginBottom: 47 }} />
                  </>
                )}

                {item.status === 2 && isValidJson(item.genChart) ? (
                  <>
                    <div style={{ marginBottom: 16 }} />
                    <Text strong>{'分析目标: ' + item.goal}</Text>
                    <br />
                    <Text>{item.genResult}</Text>
                    <div style={{ marginBottom: 16 }} />
                    <ReactEChart option={JSON.parse(item.genChart)} />
                  </>
                ) : item.genChart? (
                  <>
                    <div style={{ marginBottom: 16 }} />
                    <Text strong>{'分析目标: ' + item.goal}</Text>
                    <Result status="error" title="图表格式解析失败" subTitle={item.message} />
                    <div style={{ marginBottom: 47 }} />
                  </>
                ):null}
                {item.status === 3 && (
                  <>
                    <div style={{ marginBottom: 16 }} />
                    <Text strong>{'分析目标: ' + item.goal}</Text>
                    <Result status="error" title="图表生成失败" subTitle={item.message} />
                    <div style={{ marginBottom: 47 }} />
                  </>
                )}
              </>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ManageChart;
