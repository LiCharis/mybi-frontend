export default [
  { path: '/user', layout: false, routes: [{ path: '/user/login', component: './User/Login' }] },
  { path: '/', redirect: '/addAsyncMq' },
  // { path: '/addAsyncThreadPool', name: '智能分析(线程池异步)', icon: 'barChart', component: './AddChartAsyncThreadPool' },
  { path: '/addAsyncMq', name: '智能分析', icon: 'barChart', component: './AddChartAsyncMq' },
  { path: '/manage', name: '我的图表', icon: 'pieChart', component: './ManageChart' },
  {
    path: '/admin',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', name: '管理页面', redirect: '/admin/sub-page' },
      { path: '/admin/sub-page', name: '管理页面2', component: './Admin' },
    ],
  },
  { icon: 'table', path: '/list', component: './TableList' },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
