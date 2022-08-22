import { getDefaultQueryState } from './types';
import { createRetryer } from './retryer';
// Query是react-query底层核心类，它负责网络数据请求、状态变化的处理、以及内存回收工作。
//Query给Retryer指定fn（请求函数主体）、retry（重试次数）、retryDelay（重试延迟时间），以及一系列状态变化回调函数（比如onSuccess、onPause等）。
// Query一旦开启  会持续调用其中的retryer进行请求
//! Query有四种状态，网络请求的过程中，Query的状态会发生变化。
//Query使用经典的reducer模式处理状态变化。reducer模式  (也就是Dispatch、Action、和Reducer三个组成部分)
export class Query {
    constructor(config) {
        this.options = config.options;
        this.observers = [];
        this.cache = config.cache;
        this.queryKey = config.queryKey;
        this.state = config.state || getDefaultQueryState();
        console.log('创建Query', config.options.queryKey);
        this.updateGCTimer();
    }
    // 更新上一次的options
    updateOptions(options) {
        const removeUndefinedOptions = Object.fromEntries(Object.entries(options).filter(([_, v]) => v != null));
        this.options = Object.assign(Object.assign({}, this.options), removeUndefinedOptions);
    }
    // 装载垃圾回收器 (缓存时间到后删除Query)
    updateGCTimer() {
        const cacheTime = this.options.cacheTime;
        if (!cacheTime)
            return;
        this.GCtimer = setTimeout(() => {
            console.log('垃圾回收');
            this.destory();
            clearTimeout(this.GCtimer);
        }, cacheTime);
    }
    // Query是否正在被使用
    isActive() {
        return this.observers.some((observer) => observer.options.enable !== false);
    }
    // 数据是否新鲜(byTime)?
    isStale(staleTime = 3000) {
        const updateAt = this.state.dataUpdatedAt;
        if (!updateAt)
            return false;
        if ((Date.now() - updateAt) < staleTime)
            return true;
        return false;
    }
    // 添加一个ob
    addObserver(observer) {
        if (this.observers.indexOf(observer) === -1) {
            this.observers.push(observer);
        }
    }
    // 删除一个ob
    removeObserver(observer) {
        if (this.observers.indexOf(observer) !== -1) {
            this.observers = this.observers.filter((x) => x !== observer);
        }
    }
    // Query自我销毁
    destory() {
        const canDestory = (this.state.fetchStatus === 'idle') && (this.state.status !== 'loading');
        this.cache.removeQuery(this);
    }
    // 创建retryer  发起请求
    fetch(options) {
        // 更新options
        if (options) {
            this.updateOptions(options);
        }
        //todo 如果没指定fn  执行上一次的fn(options中保存)
        if (!this.options.queryFn) {
            return Promise.reject('Missing queryFn');
        }
        // queryKey需要数组
        if (!Array.isArray(this.options.queryKey)) {
            throw new Error(' queryKey需要是一个数组');
        }
        //todo 创建一个fetchFn
        const fetchFn = this.options.queryFn;
        // 定义retryer的回调  (dispatch一个Action 用来修改Query的状态)
        const onError = (error) => {
            this.dispatch({ type: 'error', error });
        };
        const onSuccess = (data) => {
            if (typeof data === 'undefined')
                return onError(new Error('Query data cannot be undefined'));
            this.dispatch({ type: 'success', data });
        };
        const onFail = () => {
            this.dispatch({ type: 'failed' });
            console.log('请求失败并修改了Query');
        };
        const onPause = () => {
            this.dispatch({ type: 'pause' });
        };
        const onContinue = () => {
            this.dispatch({ type: 'continue' });
        };
        //  如果空闲就发起一次请求
        if (this.state.fetchStatus === 'idle') {
            this.dispatch({ type: 'fetch' });
        }
        this.retryer = createRetryer({
            fn: fetchFn,
            // abort: false, // 终止指针
            onSuccess,
            onError,
            onFail,
            onPause,
            onContinue,
            retry: options.retry,
            retryDelay: options.retryDelay, // 延迟时间
        });
        // 将retryer返回的结果保存 并返回
        this.promise = this.retryer.promise;
        return this.promise;
    }
    // 根据action创建创建不同的reducer 来修改当前query的状态
    dispatch(action) {
        const reducer = (state) => {
            var _a;
            switch (action.type) {
                case 'fetch':
                    console.log('发起请求事件');
                    return Object.assign(Object.assign({}, state), { fetchFailureCount: 0, fetchStatus: 'fetching', status: 'loading' });
                case 'success':
                    console.log('请求成功事件');
                    return Object.assign(Object.assign({}, state), { data: action.data, dataUpdateCount: state.dataUpdateCount + 1, dataUpdatedAt: (_a = action.dataUpdatedAt) !== null && _a !== void 0 ? _a : Date.now(), error: null, status: 'success', fetchStatus: 'idle' });
                case 'failed':
                    console.log('请求失败事件');
                    return Object.assign(Object.assign({}, state), { fetchFailureCount: state.fetchFailureCount + 1 });
                case 'error':
                    const error = action.error;
                    console.log('请求错误事件');
                    return Object.assign(Object.assign({}, state), { error: error, errorUpdateCount: state.errorUpdateCount + 1, fetchFailureCount: state.fetchFailureCount + 1, status: 'error', fetchStatus: 'idle' });
                case 'pause':
                    console.log('请求暂停事件');
                    return Object.assign(Object.assign({}, state), { fetchStatus: 'paused' });
                case 'continue':
                    console.log('请求继续事件');
                    return Object.assign(Object.assign({}, state), { fetchStatus: 'fetching' });
            }
        };
        this.state = reducer(this.state); //修改query的state
        // 通知所有的observer  state更新了  observer重新渲染组件
        this.observers.forEach((observer) => {
            observer.onQueryUpdate(action);
        });
    }
}
