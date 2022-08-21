import { QueryStatus, FetchStatus, QueryOptions, Action } from './types'
import type { QueryClient } from './QueryClient'
import type { Query } from './Query'
import { Subscribable } from './subscribable'
import { isShallowEqualObject } from './utils'
// QueryObserver观察者类 用于观察query对象的变化， 然后通知订阅它的react组件。
// react-query利用了React.useState初始会保存一个状态  做到组件更新也使用同一个observer实例。
// 每次组件重渲染 - 调用useQuery  调用observer.getOptimisticResult获取数据，


// 每个useQuery都对应一个observer
// 一旦QueryObserver数据发生变化，就会触发useQuery（通过useState）所在的组件的重新渲染，从而实现数据变化驱动UI变化。


// 组件 - 调用useQuery获取数据 - 创建observer,注册监听函数 - 
// 监听options变化  staleTime 
// 最后从Query获取数据  更新observer的Result
// 触发监听函数  组件重新render



// 检查是否能fetch (数据新鲜 且 status为error时不发请求)
function shouldFetchByOptions(query: Query, options: QueryOptions): boolean {
    const shouldFetch =
        (!query.isStale(options.staleTime)) &&
        (query.state.status !== 'error')
    console.log('检查是否超过新鲜时间需要发起请求?', shouldFetch);
    return shouldFetch
}



export interface QueryObserverResult {
    status: QueryStatus
    fetchStatus: FetchStatus
    data: any
    error: Error | null
    isStale: () => boolean
    refetch: Function
    remove: Function
}


export class QueryObserver extends Subscribable {
    private client: QueryClient
    private options: QueryOptions
    private autoFetchInterval?: ReturnType<typeof setInterval>
    private currentQuery!: Query
    private currentResult!: QueryObserverResult
    trackedProps!: Set<keyof QueryObserverResult>  // 追踪的result中的属性(用户访问一个属性就追踪一个  用来比较前后是否发生变化)


    constructor(client: QueryClient, options: QueryOptions) {
        super()
        console.log('创建observer');
        this.client = client // client中保存了cache
        this.options = options
        this.trackedProps = new Set() // 被用户使用的result中的属性  进行跟踪
        this.initObserver(options) // 初始化
    }

    refetch() { }
    remove() { }

    // 调用Query发起请求
    fetch() {
        let promise = this.currentQuery.fetch(this.options)
        return promise
    }
    
    // 检查后再调用Query发起请求
    checkAndFetch() {
        const shouldFetch = shouldFetchByOptions(this.currentQuery, this.options)
        if (!shouldFetch) return
        this.fetch()
    }

    // 根据options初始化observer(创建初始query 初始请求 创建初始result)
    initObserver(options: QueryOptions) {
        this.updateQuery()// 初始化query 
        this.checkAndFetch() 
        this.updateResult() // 初始化result
        this.updateAutoFetchInterval()
    }

    // 更新currnetQuery 给query添加observer
    updateQuery() {
        const query = this.client.getQueryCache().getQuery(this.options)
        if (!query) { throw new Error('没有生成query,请检查queryKey') }
        if (this.currentQuery === query) return
        query.addObserver(this)
        console.log('添加observer');
        this.currentQuery = query
    }

    // 更新自动重请求Interval
    updateAutoFetchInterval() {
        const interval: number | false | undefined = this.options.autoFetchInterval
        if (!interval || interval <= 0) return
        clearInterval(this.autoFetchInterval)
        this.autoFetchInterval = setInterval(() => {
            this.fetch()
        }, interval)
    }

    // (根据追踪的props)更新result 获取前后两次的result
    updateResult() {
        const prevResult: QueryObserverResult | undefined = this.currentResult
        const nextResult = this.createResult(this.currentQuery, this.options)

        // 如果两个result完全是同一个对象则不更新(实际上会notify通知不更新)
        if (isShallowEqualObject(nextResult, prevResult)) return

        // 如果跟踪的result上的props变化了才更新
        let trackedPropChanged: boolean = false
        let mountResult: boolean = false
        if (typeof prevResult === 'undefined' && typeof nextResult !== 'undefined') {
            mountResult = true
        } else {
            trackedPropChanged = Object.keys(this.currentResult).some((key) => {
                const typedKey = key as keyof QueryObserverResult
                const changed = nextResult[typedKey] !== prevResult[typedKey]
                return changed && this.trackedProps.has(typedKey)
            })
            console.log('跟踪的props是否发生变化(是否可以重渲染组件??)', trackedPropChanged);
        }

        this.currentResult = nextResult

        if (mountResult || trackedPropChanged) {
            this.notifyListeners()
        }
    }

    // 处理参数  创建useQuery的返回结果  提供一些方法(isStale,reFetch,remove)
    createResult(query: Query, options: QueryOptions): QueryObserverResult {

        // 上一次的query options result
        const prevQuery = this.currentQuery
        const prevOptions = this.options
        const prevResult = this.currentResult

        let { state } = query
        let { status, fetchStatus, error, data } = state

        // 返回的结果
        const result: QueryObserverResult = {
            data,
            status,
            fetchStatus,
            error,
            isStale: query.isStale.bind(query, this.options.staleTime),
            refetch: this.refetch,
            remove: this.remove,
        }

        return result
    }

    // 创建一个result返回
    getResult(options: QueryOptions): QueryObserverResult {
        const query = this.client.getQueryCache().getQuery(options)
        return this.createResult(query, options)
    }

    // Query获取数据更新成功 调用此方法  更新Result
    onQueryUpdate(action: Action): void {
        console.log('Query获取数据更新成功  更新Result 执行回调');
        if (action.type === 'success') {
            if (this.options.onSuccess) {
                this.options.onSuccess()
            }
        } else if (action.type === 'failed') {
            if (this.options.onFail) {
                this.options.onFail()
            }
        } else if (action.type === 'error') {
            if (this.options.onError) {
                this.options.onError()
            }
        }

        this.updateResult()
    }

    // 追踪result上的属性(用户是否访问)
    trackResult(result: QueryObserverResult): QueryObserverResult {
        const trackedResult = {} as QueryObserverResult

        Object.keys(result).forEach((key) => {
            Object.defineProperty(trackedResult, key, {
                configurable: false,
                enumerable: true,
                get: () => {
                    this.trackedProps.add(key as keyof QueryObserverResult)
                    return result[key as keyof QueryObserverResult]
                },
            })
        })

        return trackedResult
    }

    // 给listeners发送通知 进行更新 (这里的Listener就是React的setState  调用执行组件render)
    notifyListeners() {
        const needNotify = this.currentResult.status !== 'loading'
        if (!needNotify) return
        this.listeners.forEach((listener) => {
            listener(this.currentResult)
        })
    }

    // 给Querys发送通知 进行更新(暂时不用)
    notifyQuerys() {

    }

}