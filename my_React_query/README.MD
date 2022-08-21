
```

type args = {
    queryKeys:string[],// 查询键  每个数据请求对应一个查询键string  
    queryFn:function,
    options:{
        retry:number // 请求失败重复次数
        retryDelay:number // 重复请求间隔
        staleTime:number  // 请求数据过期时间(过期时间内的重复请求会直接调用缓存数据)
        onSuccess:Function // 请求成功 失败  错误的回调
        onFail:Function
        onError:Function
    }
}


//React组件内使用
import { useQuery } from 'lzy-react-query'

function App() {
  const { data, status } = useQuery(...args)

  return (
      <div>数据:{data},状态为:{status}</div>
  );
}
 ```