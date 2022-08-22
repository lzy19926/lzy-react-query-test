import { useQuery } from '../index'

let testWindow: any = {}

const queryFnSuccess = () => {
    console.log('发起请求(成功)');
    return Promise.resolve('后端返回的假数据')
}
const queryFnFail = () => {
    console.log('发起请求(失败)');
    return Promise.reject('错误1111111')
}

// render1
const res = useQuery(['测试数据1'], queryFnSuccess, { retry: 6, retryDelay: 1000, staleTime: 2000 })
console.log(res);
console.log('----------------------------------------');


setTimeout(() => {
    const res2 = useQuery(['测试数据1'], queryFnSuccess, { retry: 6, retryDelay: 1000, staleTime: 2000 })
    console.log('----------------------------------------');
    console.log(res2);
}, 1000)










// const res2 = useQuery(['测试数据1'], queryFnSuccess, { retry: 6, retryDelay: 1000, staleTime: 2000 }, testWindow)

// console.log(res);
// console.log(res2);


setTimeout(() => {
    // const res3 = useQuery(['测试数据1'], queryFnSuccess, { retry: 6, retryDelay: 1000, staleTime: 2000 }, testWindow)
    // console.log(res3);
}, 0)



