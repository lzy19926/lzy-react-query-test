import { QueryObserver } from '../query-core/QueryObserver';
import { useQueryClient } from './useQueryClient';
import { getDefaultOptions } from '../query-core/types';
import React from 'react';
// 合并options和查询键，查询函数  组成一个完整的QueryOptions
function parseQueryArgs(keys, fn, options) {
    const defaultOptions = getDefaultOptions();
    return Object.assign(Object.assign(Object.assign({}, defaultOptions), options), { queryFn: fn, queryKey: keys });
}
export function useQuery(keys, queryFn, options) {
    const parsedOptions = parseQueryArgs(keys, queryFn, options); // 返回格式化后的options
    // 创建/获取一个client
    let queryClient = useQueryClient();
    if (!queryClient) {
        throw new Error('client未生成');
    }
    //构建一个新的Observer observer会作为组件的一个state存留在组件中   在组件的整个生命周期内共享一个observer
    //new Observer的同时会发起第一次请求
    const [observer] = React.useState(() => new QueryObserver(queryClient, parsedOptions));
    // 创建reRender触发器(updater)  推入listener中 Observer通知组件更新时会触发所有的updater
    // 放入useState的都会重复引用  (使用同一个render或observer)
    const reRenderer = React.useState(undefined)[1];
    observer.subscribe(reRenderer);
    // 创建result
    let result = observer.getResult(parsedOptions);
    // 如果是重复调用钩子  则发起请求
    if (result.status !== 'loading' && result.fetchStatus === 'idle') {
        observer.checkAndFetch();
    }
    return observer.trackResult(result);
}
