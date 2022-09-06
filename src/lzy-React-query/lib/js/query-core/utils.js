// 延迟代码
export function sleep(delay = 0) {
    console.log('延迟' + delay);
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}
// 浅比较两个对象是否相同
export function isShallowEqualObject(a, b) {
    if ((a && !b) || (b && !a)) {
        return false;
    }
    for (const key in a) {
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}
// 根据queryKey创建Query的hash值
export function createQueryHash(options) {
    const { queryKey } = options;
    const queryStr = JSON.stringify(queryKey[0]);
    return hashVal(queryStr);
}
function hashVal(string) {
    var hash = 0, i, chr;
    if (string.length === 0)
        return hash;
    for (i = 0; i < string.length; i++) {
        chr = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
}
