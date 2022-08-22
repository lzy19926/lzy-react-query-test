import { QueryClient } from '../query-core/QueryClient';
// 在这里创建一个client 挂载到window全局(暂定)  如果有则返回之前的client
//todo 需要修改为使用context分发
export function useQueryClient() {
    let client;
    if (typeof window === 'undefined') {
        throw new Error('window全局对象为定义');
    }
    else if (window.LzyReactQueryClient) {
        client = window.LzyReactQueryClient;
        return client;
    }
    else {
        console.log('创建client,并挂载到window上');
        window.LzyReactQueryClient = new QueryClient();
        client = window.LzyReactQueryClient;
    }
    return client;
}
