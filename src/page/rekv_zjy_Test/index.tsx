import Store from '../../Rekv_张建阳/store'

const userStore = new Store({
    age: 18
})



let startTime = Date.now()
let interval: any;
interval = setInterval(() => {
    const age = userStore.getState('age')
    userStore.setState({ age: age + 1 })
    if (age >= 118) {
        console.log(startTime - Date.now())
        clearInterval(interval)
    }
}, 100)




const Children = () => {
    const { age } = userStore.useState('age')
    return (<div>年龄:{age}</div>)
}

export default function RuzyTest({ count }: any) {
    const arr = new Array(count).fill(0)
    return (
        <>
            {arr.map((_, index) => (<Children key={index} />))}
        </>
    )
}