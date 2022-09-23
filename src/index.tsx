import React from 'react';
import ReactDOM from 'react-dom/client';
// import UseQuery from './page/useQuery/useQuery';
// import UseManyQuery from './page/useQuery/useManyQuery'
import ReactTest from './page/reactTest/index'
import RekvTest from './page/rekvTest/index'
import RuzyTest from './page/ruzyTest'
import RekyTest_zjy from './page/rekv_zjy_Test/index'
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <ReactTest />                // 5000 10000 20000组件数
  // <RekvTest count={5000} />   //!11949 !20903 !39745
  // <RuzyTest count={5000}/>   //!11804 !20304 40480
  <RekyTest_zjy count={5000} />//!12087 !20725 41743
);
