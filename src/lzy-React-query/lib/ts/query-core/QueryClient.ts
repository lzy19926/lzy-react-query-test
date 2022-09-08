import { QueryOptions } from './types'
import { QueryCache } from './QueryCache'


//! client用来提供请求服务  提供三种方法  请求（fetchQuery）  预请求（prefetchQuery） 主动失效（invalidateQueries）


//todo QueryClient是React.context管理的一个全局对象，开发者可以通过React.useContext共享QueryClient。
//todo useQueryClient hook仅仅做了简单包装。
// todo  ------------ fetchQuery------------------------
//!  fetchQuery会调用QueryCache.build尝试从QueryCache中读取Query缓存，从而实现复用曾经请求的数据。提到缓存，


export class QueryClient {
    private queryCache: QueryCache
    constructor() {
        this.queryCache = new QueryCache(this)
    }

    getQueryCache() {
        return this.queryCache
    }

    getQueryData(options: QueryOptions) {
        return this.queryCache.findQuery(options)?.state.data
    }

    getAllQueryData() {
        const querys = this.queryCache.getQueries()
        const res = {}
        for (let hash in querys) {
            const { queryKey, state } = querys[hash]
            const key = queryKey[0]
            const data = state?.data
            const url = state?.data?.request.responseURL
            Object.assign(res, { [key]: { data, url } })
        }
        return res
    }

    fetchQuery(queryOptions: QueryOptions) {
        // 给与retry默认值
        if (typeof queryOptions?.retry === 'undefined') {
            queryOptions.retry = false
        }
        // 新建/找到一个query缓存对象
        const query = this.queryCache.getQuery(queryOptions)

        // 检查数据是否新鲜(新鲜则直接返回数据)
        const isStale = query.isStale(queryOptions.staleTime)

        return isStale
            ? Promise.resolve(query.state.data)
            : query.fetch(queryOptions) //!  延时请求  实际上调用的是query.fetch方法
    }

}