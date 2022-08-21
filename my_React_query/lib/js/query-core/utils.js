// 延迟代码
export function sleep(delay) {
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
