import React from 'react'
import { StateCache } from './StateCache'
import { StateObserver } from './StateObserver'
import { batchUpdates } from './batchedUpdates'

const cache = new StateCache({
    name: '张三',
    age: 18
})


export const useBaseState = (...keys: string[]) => {
    // 给组件创建一个observer
    const [observer] = React.useState(() => new StateObserver(cache, keys))

    //todo监视keys变更
    React.useEffect(() => { }, keys)

    // 注册组件更新方法
    const updater = React.useState(undefined)[1]
    observer.subscribe(updater)

    console.log('返回页面的result', observer.createResult(keys));

    return observer.createResult(keys)

};

export const setBaseState = (param: any) => {
    const needUpdateKeys: string[] = []

    Object.keys(param).forEach((key: string) => {
        if (cache._states.get(key) !== param[key]) {
            cache._states.set(key, param[key])
            console.log(cache._states);
            needUpdateKeys.push(key)
        }
    })

    // 合并执行setState
    batchUpdates(() => {
        cache.observers.forEach((ob) => {
            ob.updateByKeys(needUpdateKeys)
        })
    })

}