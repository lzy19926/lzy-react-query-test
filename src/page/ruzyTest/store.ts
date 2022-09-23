import Ruzy from '../../ruzy/index'

const userStore = new Ruzy()
const planStore = new Ruzy()


// 初始化store
userStore.initStates({
    name: '张三',
    age: 18
})

planStore.initStates({
    plan: '计划A',
    id: 1
})


export { userStore, planStore }