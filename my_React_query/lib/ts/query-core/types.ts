import type { QueryCache } from "./QueryCache"
export type QueryStatus = 'loading' | 'error' | 'success'
export type FetchStatus = 'fetching' | 'paused' | 'idle'

export type QueryFunction = (...params: any) => Promise<any>

export type QueryKey = string[]
export interface FetchOptions {
    retry?: number | boolean,
    retryDelay?: number,
    staleTime?: number
    autoFetchInterval?: number | false,
    onSuccess?: Function,
    onFail?: Function,
    onError?: Function
}
export interface QueryOptions extends FetchOptions {
    queryKey: QueryKey,
    queryFn?: QueryFunction,
}

export interface QueryConfig {
    cache: QueryCache
    queryKey: QueryKey
    options: QueryOptions
    state?: QueryState
}

export interface QueryState {
    data: any | undefined
    dataUpdateCount: number
    dataUpdatedAt: number
    error: Error | null
    fetchFailureCount: number
    errorUpdateCount: number
    status: QueryStatus  //结果状态
    fetchStatus: FetchStatus// 查询状态
}


interface FailedAction {
    type: 'failed'
}
interface FetchAction {
    type: 'fetch'
}
interface SuccessAction {
    data: any | undefined
    type: 'success'
    dataUpdatedAt?: number
    manual?: boolean
}
interface ErrorAction {
    type: 'error'
    error: Error
}
interface PauseAction {
    type: 'pause'
}
interface ContinueAction {
    type: 'continue'
}

export type Action =
    | ContinueAction
    | ErrorAction
    | FailedAction
    | FetchAction
    | PauseAction
    | SuccessAction

export interface Retryer {
    promise: Promise<any>
}

function getDefaultQueryState(): QueryState {
    return {
        data: undefined,
        dataUpdateCount: 0,
        dataUpdatedAt: 0,
        error: null,
        fetchFailureCount: 0,
        errorUpdateCount: 0,
        status: 'loading',  //结果状态
        fetchStatus: 'idle'// 查询状态
    }
}

function getDefaultOptions(): QueryOptions {
    return {
        queryKey: [],
        retry: 3,
        retryDelay: 1000,
        staleTime: 5000,
        autoFetchInterval: false
    }
}


export { getDefaultQueryState, getDefaultOptions }
