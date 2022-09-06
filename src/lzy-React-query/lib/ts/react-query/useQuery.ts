import { QueryClient } from './../query-core/QueryClient';
import { log } from 'console';
import { QueryObserver, QueryObserverResult } from '../query-core/QueryObserver'
import { useQueryClient } from './useQueryClient'
import { QueryKey, QueryFunction, FetchOptions, } from '../query-core/types'
import { getDefaultOptions } from '../query-core/types'
import React from 'react'

// 合并options和查询键，查询函数  组成一个完整的QueryOptions
function parseQueryArgs(keys: QueryKey, fn?: QueryFunction, options?: FetchOptions) {
    const defaultOptions = getDefaultOptions()
    return { ...defaultOptions, ...options, queryFn: fn, queryKey: keys }
}


export function useQuery(
    keys: QueryKey,
    queryFn: QueryFunction,
    options?: FetchOptions,
    outerQueryClient?: QueryClient
): QueryObserverResult {
    const parsedOptions = parseQueryArgs(keys, queryFn, options) // 返回格式化后的options
    // 创建/获取一个client
    let queryClient: QueryClient;   //!   测试用外部client
    queryClient = useQueryClient()
    if (outerQueryClient) { queryClient = outerQueryClient }
    if (!queryClient) { throw new Error('client未生成') }

    //构建一个新的Observer  放入useState的都会重复引用  (使用同一个render或observer)  在组件的整个生命周期内共享一个observer
    //new Observer的同时会发起第一次请求
    const [observer] = React.useState(() => new QueryObserver(queryClient, parsedOptions))

    //监视options变更(每次render都会触发  因为每个传入的options引用不一样)
    React.useEffect(() => {
        observer.handleOptionsChange(parsedOptions)
    }, [parsedOptions])

    // 创建reRender触发器(updater)  推入listener中 Observer通知组件更新时会触发所有的updater
    const reRenderer = React.useState(undefined)[1]
    observer.subscribe(reRenderer)

    // 创建result
    let result = observer.getResult(parsedOptions)

    // 如果是重复调用钩子  则发起请求
    if (result.status !== 'loading' && result.fetchStatus === 'idle') {
        observer.checkAndFetch()
    }

    // 处理错误边界
    // if (result.error) {
    //     throw result.error
    // }

    return observer.trackResult(result)
}