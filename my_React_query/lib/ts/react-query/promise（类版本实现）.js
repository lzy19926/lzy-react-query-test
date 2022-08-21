

// -----------------------Promise类版本的实现------------------------------------- 
export default class Promise {


    //-----------------------构造promise函数本体-----------------------
    constructor(executor) {
        // 定义promise状态
        this.PromiseState = 'pending' // 初始值
        // 定义初始promise值
        this.PromiseResult = null
        // 声明属性 用来保存then传入的两个函数参数
        this.callbacks = []
        // 传递that  让其进入下面的两个函数
        let that = this

        //--------------定义resolve和reject函数------------------------------
        function resolve(value) {

            // 判断PromiseState是否为pending (如果不是就不能进行状态修改  不执行执行器函数)
            if (that.PromiseState === 'pending') {
                console.log('调用了resolve');
                // 调用resolve后改变状态 
                that.PromiseState = 'resolved'
                // 改变结果的值
                that.PromiseResult = value
                //将其变为异步操作(放到setTimeout里)
                setTimeout(() => {
                    // 循环数组  调用所有成功回调
                    that.callbacks.forEach(item => {
                        item.onResolved(that.PromiseResult)
                    })
                })



            }

        }

        function reject(reason) {

            // 判断PromiseState是否为pending (如果不是就不能进行状态修改  不执行执行器函数)
            if (that.PromiseState === 'pending') {
                // 调用reject后改变状态 
                that.PromiseState = 'reject'
                //改变结果的值
                that.PromiseResult = reason
                //将其变为异步操作(放到setTimeout里)
                setTimeout(() => {
                    // 循环数组  调用所有失败回调
                    that.callbacks.forEach(item => {
                        item.onRejected(that.PromiseResult)
                    })
                })


            }


        }


        // --------------使用throw抛出异常的实现----------------------
        // 使用try catch 
        //  throw "error" 就是try catch时  catch捕获的错误   error会传给catch(e)中的e
        // 所以当出错catch时   调用reject  传入e即可
        try {
            // 调用执行器函数 里面传入resolve和reject函数   
            executor(resolve, reject)

        } catch (e) {
            // 修改promise对象状态为[失败](调用reject)
            // 此时你抛出的error就是reject的结果值
            reject(e)
        }


        // promise对象最后返回一个promise对象 
        return this
    }

    //--------------------------then方法封装-------------------------
    then(onResolved, onRejected) {
        const self = this // 提取this

        // 判断回调函数参数(查看是否传入了onResolved,onRejected)
        if (typeof onRejected !== 'function') {
            //给onRejected创建一个默认值(否则后面的catch就没有参数了)
            onRejected = reason => {
                throw reason
            }
        }
        // onResolve不传递也可以继续执行 (因为最后catch的时候传入的onResolve=undefined)
        if (typeof onResolved !== 'function') {
            onResolved = value => value
            //简写 相当于 value=>{return value}
        }

        // then方法返回一个promise对象
        return new Promise((resolve, reject) => {

            //------------------封装callback函数---------------------
            // 传入type  当type为onResolved时  callback就是onResolved的改版
            //           当type为onRejected时  callback就是onRejected的改版
            function callback(type) {
                try {
                    // 获取回调函数的执行结果
                    let result = type(self.PromiseResult)
                    //注意  then回调返回的应该是一个promise对象  进行判断
                    if (result instanceof Promise) {
                        //如果回调结果是一个promise对象 那就再次调用then方法
                        result.then(v => {
                            resolve(v)
                        }, r => {
                            reject(r)
                        })
                    } else {
                        // 需要将结果对象状态变为[成功]
                        resolve(result) //并且设置promiseResult结果为返回的结果
                    }
                } catch (e) {
                    reject(e)
                }

            }

            //----------------resolve情况-------------------------
            //调用回调函数  成功执行onResolved 失败执行onRejected
            // 因为是定义在Promise原型上的方法  可以使用this获得原型对象
            if (this.PromiseState === 'resolved') {
                // 将onResolved变为异步操作 (放入setTimeout里)
                setTimeout(() => {
                    // 执行onResolved一号回调
                    callback(onResolved)
                })
            }

            //--------------reject情况-------------------------------
            if (this.PromiseState === 'reject') {
                //将onRejected变为异步操作 (放入setTimeout里)
                setTimeout(() => {
                    // 执行onRejected二号回调
                    callback(onRejected)
                })

            }


            //----------------pending情况-------------------------------
            // 在异步任务中, .then的执行应该是在改变状态的时候进行执行 
            //所以我们需要在改变状态以后再执行回调
            //判断pending状态   当promise中的异步函数还未执行(状态未改变的时候),
            //将传入then中的回调函数保存起来    那么之后就可以在resolve和reject中使用   

            //---------------------------------------------
            if (this.PromiseState === 'pending') {
                // 保存回调函数的内容 (将两个回调保存为对象 push到数组里)
                this.callbacks.push({
                    // 这两个回调会放到reject,resolve中执行  ,而且是先改变状态后再执行
                    // 将两个回调函数封装成函数 保存起来
                    //callback(onResolved): 执行onResolved回调
                    //callback(onRejected): 执行onRejected回调
                    onResolved: function () { callback(onResolved) },
                    onRejected: function () { callback(onRejected) }
                })

            }

        })
    }

    //--------------------------catch方法封装-----------------------------
    catch(onRejected) {
        // 直接调用then方法并返回(也就是返回下一层的promise)
        return this.then(undefined, onRejected)
    }


    // 因为下面的方法不属于Promise实例对象  而是属于promise构造函数本体  需要使用static关键字
    //---------------------------resolve方法封装----------------------------
    static resolve(value) {

        //返回一个promise对象
        return new Promise((resolve, reject) => {
            // 判断
            if (value instanceof Promise) {
                //如果传入的是一个promise对象    那么返回的promise对象的状态取决于传入的promise
                //(传入成功, 传出的也成功,传入失败,传出的也失败)
                value.then(v => {
                    resolve(v)
                }, r => {
                    reject(r)
                })
            } else {
                //状态设置为成功
                resolve(value)
            }
        })
    }

    //---------------------------reject方法封装------------------------------
    static reject(reason) {

        //返回promise对象
        return new Promise((resolve, reject) => {
            // 判断reason     
            if (reason instanceof Promise) {
                //如果传入的是promise对象  使用.then方法(传入成功,返回成功,传入失败,返回失败)
                reason.then(v => {
                    resolve(v)
                }, r => {
                    reject(r)
                })
            } else { // 如果是普通值  返回reject的promise  值为传入的reason
                reject(reason)
            }
        })
    }

    //----------------------------all方法封装-----------------------------------
    static all(promiseArr) {

        //返回一个promise对象
        return new Promise((resolve, reject) => {
            // 声明计数器 
            let count = 0
            // 存放成功结果数组
            let resultArr = []

            //遍历检测数组中promise对象的状态
            for (i = 0; i < promiseArr.length; i++) {
                // 数组中promise对象可以使用then方法,如果then后执行了第一个回调,说明是成功的promise


                promiseArr[i].then(v => { //-------- 执行我成功 让计数器+1
                    count++
                    // 将成功promise结果存入数组中
                    // 注意  这里不使用push,因为有可能保存的结果顺序不同(异步) 所以使用arr[i]=v 
                    resultArr[i] = v
                    if (count = promiseArr.length) {// 如果count达到最大值 表明所有promise都成功
                        resolve(resultArr) //调用resolve函数修改最后返回的promise状态//传入结果数组
                    }


                }, r => {//---------执行我失败(有一个失败  整体就失败)
                    reject(removeEventListener)
                })
            }
        })
    }

    //----------------------------race方法封装--------------------------------
    static race(promisesArr) {
        return new Promise((resolve, reject) => {
            //遍历结果
            for (let i = 0; i < promisesArr.length; i++) {
                //注意 这里不需要执行其他逻辑   因为传入的promises中,谁先执行,谁就会先调用.then方法
                // 执行回调  修改返回对象状态并返回     
                promisesArr[i].then(v => {
                    //修改返回对象状态为[成功]
                    resolve(v)
                }, r => {
                    // 修改返回对象状态为[失败]
                    reject(r)
                })
            }
        })
    }
}