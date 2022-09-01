import React from 'react';
import { useQuery } from './lzy-React-query/index'
import { getUser, queryFnSuccess, queryFnFail } from './queryFn'
import { useState } from 'react';

const callbacks = {
  onSuccess: (data: any) => {
    console.log('执行success回调', data);
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
  const { data, status, isStale } = useQuery(['测试数据1'], queryFnSuccess,
    {
      retry: 1,
      retryDelay: 500,
      staleTime: 3000,
      ...callbacks,
    })

  const [num, setNum] = useState(0)

  return (
    <div>
      <h1>React App</h1>
      <div>数据:{data?.data},状态为:{status},是否新鲜:{isStale().toString()}</div>
      <button onClick={() => { setNum(num + 1) }}>num++{num}</button>
    </div>
  );
}

export default App;



// cacheTime 缓存时间到后清除Query  同时通知cache进行清除(大问题)
//  刷新页面window会重置  client也会重置   需要修改
//  多次创建observer问题 

//todo  enable条件查询开发
//todo  需要判断网络状态 如果online才发生请求
//todo  尝试支持websocket功能


//! 修复return Promise.reject()的queryFn   会执行uncatchErr问题
//! 在请求处定义的catch会返回一个undefined的error 放到result中