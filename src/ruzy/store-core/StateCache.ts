import { StateObserver } from './StateObserver'
import React from 'react'
import { batchUpdates } from './batchedUpdates'
import { isPlainObject } from './utils'

//!  StateCache保存了全局state,并提供了调用state的方法

export class StateCache {
    _states: Record<string, any>
    observers: StateObserver[]
    constructor(initState: any) {
        this._states = new Map()
        this.observers = []
        this.initState(initState)
    }

    initState(initState: any) {
        if (!isPlainObject(initState)) {
            throw new Error('init state is not a plain object');
        }
        this._states = new Map(Object.entries(initState))
    }

    getState(key: string) {
        return this._states.get(key)
    }

    getAllState() {
        return this._states
    }
    //! 这里钩子最好不要放到类组件里使用
    useBaseState = (...keys: string[]) => {
        // 给组件创建一个observer
        const [observer] = React.useState(() => new StateObserver(this, keys))

        //todo监视keys变更
        React.useEffect(() => { }, keys)

        // 注册组件更新方法
        const updater = React.useState(undefined)[1]
        observer.subscribe(updater)

        return observer.createResult(keys)

    };

    setBaseState(param: any) {
        const needUpdateKeys: string[] = []

        Object.keys(param).forEach((key: string) => {
            if (this._states.get(key) !== param[key]) {// 注意这里使用map数据结构
                this._states.set(key, param[key])
                needUpdateKeys.push(key)
            }
        })

        // 合并执行setState
        batchUpdates(() => {
            this.observers.forEach((ob) => {
                ob.updateByKeys(needUpdateKeys)
            })
        })

    }
}