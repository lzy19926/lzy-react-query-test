import React from "react";
import { useQuery } from '../lzy-React-query/index'
import { render, waitFor } from '@testing-library/react'
import { QueryFunction } from "../lzy-React-query/lib/ts/query-core/types";


// 延迟函数
function sleep(timeout: number): Promise<void> {
    return new Promise((resolve, _reject) => {
        setTimeout(resolve, timeout)
    })
}
// 请求函数
const queryFnSuccess = async () => {
    await sleep(10)
    return Promise.resolve('testData')
}
const queryFnUnsuccess = async () => {
    await sleep(10)
    return Promise.reject('rejected')
}
const selectQueryFn = (res: string): any => {
    if (res === 'success') return queryFnSuccess
    if (res === 'fail') return queryFnUnsuccess
}

// 每个测试结束需要重置全局Client
beforeEach(() => {
    window.LzyReactQueryClient = undefined
})
afterEach(() => {
    window.LzyReactQueryClient = undefined
})


describe('useQuery', () => {

    it('should return correct state for a successful query', async () => {
        const key = ['queryKey_1']
        const results: any[] = []

        function Page() {
            const result = useQuery(key, queryFnSuccess)
            results.push(result)
            return <div>{result.data}</div>
        }

        // 使用@testing-library/react的render测试渲染组件 (可执行钩子和自定义钩子)
        const rendered = render(<Page />)

        // waitFor 等待渲染结果(当得到渲染结果"data:data"时)
        await waitFor(() => rendered.getByText('testData'))

        // 进行结果判断
        expect(results.length).toEqual(2)

        expect(results[0]).toEqual({
            data: undefined,
            status: 'loading',
            fetchStatus: 'fetching',
            error: null,
            isStale: expect.any(Function),
            refetch: expect.any(Function),
            remove: expect.any(Function),
        })
        expect(results[1]).toEqual({
            data: 'testData',
            status: 'success',
            fetchStatus: 'idle',
            error: null,
            isStale: expect.any(Function),
            refetch: expect.any(Function),
            remove: expect.any(Function),
        })
    })

    it('should return correct state for a unsuccessful query', async () => {
        const key = ['queryKey_1']
        const results: any[] = []

        function Page() {
            const result = useQuery(key, queryFnUnsuccess, { retry: 2, retryDelay: 10 })
            results.push(result)
            return <h1>Status:{result.status}</h1>
        }

        const rendered = render(<Page />)
        await waitFor(() => rendered.getByText('Status:error'))

        expect(results.length).toEqual(2)// 错误请求不会render页面
        expect(results[0]).toEqual({
            data: undefined,
            status: 'loading',
            fetchStatus: 'fetching',
            error: null,
            isStale: expect.any(Function),
            refetch: expect.any(Function),
            remove: expect.any(Function),
        })
        expect(results[1]).toEqual({
            data: undefined,
            status: 'error',
            fetchStatus: 'idle',
            error: 'rejected',
            isStale: expect.any(Function),
            refetch: expect.any(Function),
            remove: expect.any(Function),
        })
    })

    it('should allow to set default data value', async () => {
        const key = ['queryKey_1']

        function Page() {
            const { data = 'default' } = useQuery(key, queryFnSuccess)
            return <div>{data}</div>
        }

        const rendered = render(<Page />)
        rendered.getByText('default')
        await waitFor(() => rendered.getByText('testData'))
    })

    it('should call onSuccess after a query has been fetched', async () => {
        const key = ['queryKey_1']
        const states: any[] = []
        const onSuccess = jest.fn()

        function Page() {
            const state = useQuery(key, queryFnSuccess, { onSuccess })
            states.push(state)
            return <div>Status:{state.status}</div>
        }

        const rendered = render(<Page />)

        await rendered.findByText('Status:success')
        expect(onSuccess).toHaveBeenCalledTimes(1)
        expect(onSuccess).toHaveBeenCalledWith('testData')
    })

    it('should call onSuccess after a query has been refetched', async () => {
        const key = ['queryKey_1']
        const states: any[] = []
        const onSuccess = jest.fn()
        const onFail = jest.fn()
        let queryRes = 'fail' // 第一次为fail 第二次为success

        function Page() {
            let queryFn = selectQueryFn(queryRes)
            queryRes = 'success'
            const state = useQuery(key, queryFn, { retry: 3, retryDelay: 10, onSuccess, onFail })
            states.push(state)
            return <div>Status:{state.status}</div>
        }

        const rendered = render(<Page />)

        await rendered.findByText('Status:error')
        expect(onFail).toHaveBeenCalledTimes(1)
        expect(onSuccess).toHaveBeenCalledTimes(1)
        expect(onSuccess).toHaveBeenCalledWith('testData')
    })

    it('失败retry次数测试', async () => {
        const key = ['queryKey_1']
        const states: any[] = []
        let count = 0

        const queryFnUnsuccess = async () => {
            count++
            await sleep(10)
            return Promise.reject('rejected')
        }

        function Page() {
            const state = useQuery(key, queryFnUnsuccess, { retry: 3, retryDelay: 10 })
            return <div>Status:{state.status}</div>
        }

        const rendered = render(<Page />)
        await rendered.findByText('Status:error')
        expect(count).toBe(4)
    })

    it('失败retry后应该执行onFail回调', async () => {
        const key = ['queryKey_1']
        const states: any[] = []
        const onFail = jest.fn()

        function Page() {
            const state = useQuery(key, queryFnUnsuccess, { retry: 3, retryDelay: 10, onFail })
            return <div>Status:{state.status}</div>
        }

        const rendered = render(<Page />)
        await rendered.findByText('Status:error')
        expect(onFail).toHaveBeenCalledTimes(3)
    })

    it('error后应该执行onError回调', async () => {
        const key = ['queryKey_1']
        const states: any[] = []
        const onError = jest.fn()

        function Page() {
            const state = useQuery(key, queryFnUnsuccess, { retry: 3, retryDelay: 10, onError })
            return <div>Status:{state.status}</div>
        }

        const rendered = render(<Page />)
        await rendered.findByText('Status:error')
        expect(onError).toHaveBeenCalledTimes(1)
    })



})









