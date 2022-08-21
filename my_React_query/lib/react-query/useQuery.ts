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
    options: FetchOptions,
): QueryObserverResult {

    const parsedOptions = parseQueryArgs(keys, queryFn, options) // 返回格式化后的options

    // 创建/获取一个client
    let queryClient = useQueryClient()
    if (!queryClient) { throw new Error('client未生成') }

    //构建一个新的Observer observer会作为组件的一个state存留在组件中   在组件的整个生命周期内共享一个observer
    const _ob = new QueryObserver(queryClient, parsedOptions)
    const [observer] = React.useState(() => _ob)


    // 创建reRender触发器(updater)  推入listener中 Observer通知组件更新时会触发所有的updater
    const [renderTimes, render] = React.useState(0)
    const updater = () => { render((oldTimes) => oldTimes + 1) }
    observer.subscribe(updater)

    // 创建result
    let result = observer.getResult(parsedOptions)

    // 如果result空闲  则发起请求
    if (result.status === 'loading' && result.fetchStatus === 'idle') {
        // throw observer.fetchResult(parsedOptions)
    }

    return observer.trackResult(result)
}