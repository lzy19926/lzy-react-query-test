import { Query } from './Query';
import { Subscribable } from './subscribable';
import { createQueryHash } from './utils';
//! QueryCache挂载在QueryClient上   这里储存了多个query数据结构  用于管理多个Query
export class QueryCache extends Subscribable {
    constructor(client, config) {
        super();
        this.config = config || {};
        this.queries = new Set();
        this.queriesMap = {};
        this.queryClient = client;
    }
    // 通过options获取query
    getQuery(options, state) {
        let query = this.findQuery(options) ||
            this.createQuery(options, state);
        return query;
    }
    getQueries() {
        return this.queriesMap;
    }
    // 新建一个query
    createQuery(options, state) {
        const queryHash = createQueryHash(options);
        const newQuery = new Query({
            cache: this,
            queryKey: options.queryKey,
            queryHash,
            options,
            state
        });
        this.addQuery(newQuery);
        return newQuery;
    }
    // 添加一个query到cache中  (map键值对用于去重)
    addQuery(query) {
        const hash = query.queryHash;
        if (!this.queriesMap[hash]) {
            this.queriesMap[hash] = query;
            this.queries.add(query);
        }
    }
    // 删除Query
    removeQuery(query) {
        const hash = query.queryHash;
        if (this.queriesMap[hash] === query) {
            delete this.queriesMap[hash];
            this.queries.delete(query);
        }
        console.log('删除Query', this.queries);
    }
    // 通过查询键hash 找到query并返回
    findQuery(options) {
        const queryHash = createQueryHash(options);
        return this.queriesMap[queryHash];
    }
}
