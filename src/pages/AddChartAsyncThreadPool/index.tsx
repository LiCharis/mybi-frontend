import {generateByAiMqUsingPost, generateByAiThreadPoolUsingPost} from '@/services/mybi/chartController';
import { InboxOutlined } from '@ant-design/icons';
import { Button, message, Select, Space, Upload } from 'antd';
import Form from 'antd/lib/form';
import TextArea from 'antd/lib/input/TextArea';
import React, { useState } from 'react';
// 引入ECharts主模块
import { ProForm } from '@ant-design/pro-form';
import { Card } from 'antd/lib';
import useForm = ProForm.useForm;

const AddChartAsyncMq: React.FC = () => {
  /**
   * 记录返回信息
   */
  const [chart, setChart] = useState<API.ChartVO>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [option, setOption] = useState<any>();

  const [form] = useForm();

  const onFinish = async (values: any) => {
    //如果正在提交，直接返回避免重复提交
    if (submitting) {
      return;
    }
    setSubmitting(true);

    console.log('Received values of form: ', values);
    const params = {
      ...values,
      file: undefined,
    };

    /**
     * 提交
     */
    try {
      const res = await generateByAiThreadPoolUsingPost(params, {}, values.file.file.originFileObj);
      if (res.code === 0) {
        console.log(option);
        message.success('提交成功！稍后请在图表界面查看结果');
        //清空表单
        form.resetFields();
      } else {
        message.error('分析失败,' + res.message);
      }
    } catch (error: any) {
      message.error('分析失败,' + error.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="addChartAsync">
      <Card title={'智能分析(线程池异步)'}>
        <Form
          form={form}
          name="addChart"
          onFinish={onFinish}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          initialValues={{}}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="goal"
            label="分析目标"
            rules={[{ required: true, message: '请输入分析目标!' }]}
          >
            <TextArea placeholder="请输入你的分析需求" />
          </Form.Item>

          <Form.Item name="name" label="图表名称">
            <TextArea placeholder="请输入图表名称" />
          </Form.Item>

          <Form.Item name="chartType" label="图表类型" hasFeedback>
            <Select
              defaultValue="柱状图"
              style={{ width: 120 }}
              options={[
                { value: '折线图', label: '折线图' },
                { value: '柱状图', label: '柱状图' },
                { value: '散点图', label: '散点图' },
                { value: '饼图', label: '饼图' },
                { value: 'K线图', label: 'K线图' },
                { value: '雷达图', label: '雷达图' },
                { value: '树图', label: '数图' },
              ]}
            />
          </Form.Item>

          <Form.Item label="上传csv文件">
            <Form.Item name="file" noStyle>
              <Upload.Dragger name="file" action="">
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">Support for a single or bulk upload.</p>
              </Upload.Dragger>
            </Form.Item>
          </Form.Item>

          <Form.Item wrapperCol={{ span: 16, offset: 6 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
                智能分析
              </Button>
              <Button htmlType="reset">重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
export default AddChartAsyncMq;
