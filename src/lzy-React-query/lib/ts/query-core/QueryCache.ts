import type { QueryClient } from './QueryClient';
import { Query } from './Query'
import { QueryState, QueryOptions } from './types'
import { Subscribable } from './subscribable'


//! QueryCache挂载在QueryClient上   这里储存了多个query数据结构  用于管理多个Query
export class QueryCache extends Subscribable {
    private config: {}
    private queries: Set<Query>
    private queriesMap: Record<string, Query>
    private queryClient: QueryClient

    constructor(client: QueryClient, config?: any) {
        super()
        this.config = config || {}
        this.queries = new Set()
        this.queriesMap = {}
        this.queryClient = client
    }

    // 通过options获取query
    getQuery(options: QueryOptions, state?: QueryState): Query {
        let query =
            this.findQuery(options.queryKey[0]) ||
            this.createQuery(options, state)
        return query
    }

    getQueries() {
        return this.queriesMap
    }

    // 新建一个query
    createQuery(options: QueryOptions, state?: QueryState) {
        const newQuery = new Query({
            cache: this,
            queryKey: options.queryKey,
            options,
            state
        })
        this.addQuery(newQuery)

        return newQuery
    }

    // 添加一个query到cache中  (map键值对用于去重)
    addQuery(query: Query) {
        const key = query.queryKey[0]
        if (!this.queriesMap[key]) {
            this.queriesMap[key] = query
            this.queries.add(query)
        }
    }

    // 删除Query
    removeQuery(query: Query) {
        const key = query.queryKey[0]
        if (this.queriesMap[key] === query) {
            delete this.queriesMap[key]
            this.queries.delete(query)
        }
    }

    //TODO 通过查询键/函数 找到query并返回
    findQuery(queryKey: string) {
        return this.queriesMap[queryKey]
    }
}

