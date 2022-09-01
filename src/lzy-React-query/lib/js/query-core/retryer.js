import { sleep } from './utils';
//TODO  createRetryer会执行run方法  开始查询循环 
//TODO  如果接收到数据  执行自己封装的resolve/reject 自己封装的resolve/reject会先执行回调  然后执行外部.then中定义的resolve和reject
//todo  执行自己封装的resolve/reject会改变 isResolved状态 用于停止循环
//todo  如果没有正常获得数据  不会执行自己封装的resolve/reject  此时会进入retry逻辑 重复发起请求  达到上限后直接执行reject  停止请求
//todo  这里相当于截断了promise的执行流程   执行res之前先执行回调
export function createRetryer(config) {
    let failureCount = 0;
    let isResolved = false; //执行了自定义的res或rej后会改变  之后不会继续执行
    let promiseResolve = (value) => { };
    let promiseReject = (value) => { };
    //todo 截断promise执行流程
    //outerResolve是Promise的执行器函数  会执行所有的.then中定义的onResolved函数
    const promise = new Promise((outerResolve, outerReject) => {
        promiseResolve = outerResolve;
        promiseReject = outerReject;
    }).catch((err) => {
        console.error(err);
    });
    // 这里重新封装了resolve和reject(执行器函数)
    //!首先保存原本的resolve和reject，在执行原本的resolve和reject之前先改变retryer的状态 并执行相应的回调(onsuccess,onfail)
    const resolve = (value) => {
        var _a;
        if (isResolved)
            return;
        isResolved = true;
        (_a = config.onSuccess) === null || _a === void 0 ? void 0 : _a.call(config, value);
        promiseResolve(value); // 执行后续.then中定义的onResolve函数
    };
    const reject = (value) => {
        var _a;
        if (isResolved)
            return;
        isResolved = true;
        (_a = config.onError) === null || _a === void 0 ? void 0 : _a.call(config, value);
        promiseReject(value); // 执行所有.catch中定义的onReject函数
    };
    // 启动retryer会执行run方法   开始查询循环   中途如果出现变化(接收到数据)  返回数据或做其他处理
    const run = () => {
        if (isResolved)
            return;
        // 执行函数  获取结果或者抛出promise错误
        let promiseOrValue;
        try {
            promiseOrValue = config.fn(); //!Promise.resolve()  执行queryFn 
        }
        catch (err) {
            promiseOrValue = Promise.reject(err);
        }
        // 将结果丢入promise继续循环
        Promise.resolve(promiseOrValue)
            .then(resolve) // 首先调用resolve返回结果
            .catch((error) => {
            if (isResolved)
                return;
            retry(error);
        });
    };
    const retry = (error) => {
        var _a, _b, _c;
        const retry = (_a = config.retry) !== null && _a !== void 0 ? _a : 3;
        const retryDelay = (_b = config.retryDelay) !== null && _b !== void 0 ? _b : 3000;
        const shouldRetry = config.retry === true || failureCount < retry;
        // 如果重复次数到上限 或者 配置为false  直接执行reject
        if (!shouldRetry)
            return reject(error);
        // 如果需要重复  计数器++ 执行onFail回调
        failureCount++;
        (_c = config.onFail) === null || _c === void 0 ? void 0 : _c.call(config, error);
        // 延迟后再次执行请求
        sleep(retryDelay).then(() => {
            run();
        });
    };
    // 开始执行循环
    run();
    return {
        promise
    };
}
