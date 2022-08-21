import { QueryClient } from '../query-core/QueryClient';



declare global {
    interface Window {
        LzyReactQueryClient?: QueryClient
    }
}

//! 模拟window对象
// let window: { LzyReactQueryClient?: QueryClient } = {}

// 在这里创建一个client 挂载到window全局(暂定)  如果有则返回之前的client
//todo 需要修改为使用context分发
export function useQueryClient() {
    let client: QueryClient | undefined = undefined

    if (typeof window === 'undefined') {
        throw new Error('window全局对象为定义')
    }
    if (window.LzyReactQueryClient) {
        console.log('从window全局对象中获取client');
        client = window.LzyReactQueryClient
        return client
    }
    if (typeof window !== 'undefined') {
        console.log('创建client,并挂载到window上');
        window.LzyReactQueryClient = new QueryClient()
        client = window.LzyReactQueryClient
    }

    return client
}