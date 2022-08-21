import React from 'react';
import { useQuery } from 'lzy-react-query'
import { getUser, queryFnSuccess, queryFnFail } from './queryFn'
import { useState } from 'react';

const callbacks = {
  onSuccess: () => {
    // console.log('执行success回调');
  },
  onFail: () => {
    // console.log('执行fail回调');
  },
  onError: () => {
    // console.log('执行error回调');
  }
}


function App() {
  console.log('---------render-----------');

  const { data, status, isStale } = useQuery(['测试数据1'], queryFnSuccess, { retry: 6, retryDelay: 1000, staleTime: 3000, autoFetchInterval: false, ...callbacks })

  const [num, setNum] = useState(0)

  return (
    <div>
      <h1>React App</h1>
      <div>数据:{data?.data},状态为:{status}</div>
      <button onClick={() => { setNum(num + 1) }}>num++{num}</button>
    </div>
  );
}

export default App;


//todo  刷新页面window会重置  client也会重置   需要修改?？？？
//todo  多次创建observer问题 (垃圾回收)

//todo  需要判断网络状态 如果online才发生请求
//todo  尝试支持websocket功能