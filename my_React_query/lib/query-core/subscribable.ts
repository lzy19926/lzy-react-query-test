// 发布订阅类方法   当下的Listener是一个函数

export type Listener = Function
export class Subscribable {
    protected listeners: Listener[]

    constructor() {
        this.listeners = []
        this.subscribe = this.subscribe.bind(this)
    }

    subscribe(listener: Listener): () => void {
        this.listeners.push(listener)
        this.onSubscribe()
        return () => {
            this.listeners = this.listeners.filter((x) => x !== listener)
            this.onUnsubscribe()
        }
    }

    hasListeners(): boolean {
        return this.listeners.length > 0
    }

    protected onSubscribe(): void {
        // Do nothing
    }

    protected onUnsubscribe(): void {
        // Do nothing
    }
}