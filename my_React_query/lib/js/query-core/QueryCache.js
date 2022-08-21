import { Query } from './Query';
import { Subscribable } from './subscribable';
//! QueryCache挂载在QueryClient上   这里储存了多个query数据结构  用于管理多个Query
export class QueryCache extends Subscribable {
    constructor(client, config) {
        super();
        this.config = config || {};
        this.queries = [];
        this.queriesMap = {};
        this.queryClient = client;
    }
    // 通过options获取query
    getQuery(options, state) {
        let query = this.findQuery(options.queryKey[0]) ||
            this.createQuery(options, state);
        return query;
    }
    // 新建一个query
    createQuery(options, state) {
        const newQuery = new Query({
            cache: this,
            queryKey: options.queryKey,
            options,
            state
        });
        this.addQuery(newQuery);
        return newQuery;
    }
    // 添加一个query到cache中  (map键值对用于去重)
    addQuery(query) {
        const key = query.queryKey[0];
        if (!this.queriesMap[key]) {
            this.queriesMap[key] = query;
            this.queries.push(query);
        }
    }
    // 删除Query
    removeQuery(query) {
    }
    //TODO 通过查询键/函数 找到query并返回
    findQuery(queryKey) {
        // return this.queries.find((query) => matchQuery(queryKey, query))
        return this.queriesMap[queryKey];
    }
}
