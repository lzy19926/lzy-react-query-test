import axios from "axios";

// 延迟函数
async function delayer(time = 2000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, time);
    });
}

export const queryFnSuccess = async () => {
    console.log('发起请求(成功)');
    await delayer(1000) // 1s后返回数据
    return Promise.resolve('后端返回的假数据')
}
export const queryFnFail = async () => {
    console.log('发起请求(失败)');
    await delayer(1000)
    return Promise.reject('错误1111111')
}
export const queryFnUndefined = async () => {
    await delayer(1000)
    return Promise.resolve(undefined)
}


export function getUser() {
    return axios.get('http://localhost:3030/user')
}

