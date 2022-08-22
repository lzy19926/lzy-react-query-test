function getDefaultQueryState() {
    return {
        data: undefined,
        dataUpdateCount: 0,
        dataUpdatedAt: 0,
        error: null,
        fetchFailureCount: 0,
        errorUpdateCount: 0,
        status: 'loading',
        fetchStatus: 'idle' // 查询状态
    };
}
function getDefaultOptions() {
    return {
        queryKey: [],
        retry: 3,
        retryDelay: 1000,
        staleTime: 5000,
        cacheTime: 10000,
        autoFetchInterval: false
    };
}
export { getDefaultQueryState, getDefaultOptions };
