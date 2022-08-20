import React from 'react';
import { useQuery } from './my_React_query/lib/index'
import { queryFnSuccess, queryFnFail } from './queryFn'

const callbacks = {
  onSuccess: () => {
    console.log('执行success回调');
  },
  onFail: () => {
    console.log('执行fail回调');
  },
  onError: () => {
    console.log('执行error回调');
  }
}


function App() {
  console.log('---------render-----------');
  const { data, status } = useQuery(['测试数据1'], queryFnFail, { retry: 6, retryDelay: 1000, staleTime: 2000, ...callbacks }, window)

  return (
    <div>
      <h1>React App</h1>
      <div>数据:{data},状态为:{status}</div>
    </div>
  );
}

export default App;
