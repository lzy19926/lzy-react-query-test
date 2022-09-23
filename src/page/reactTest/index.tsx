import { useState } from "react";




let i: any;
let initAge = 18
let startTime = Date.now()

export default function App() {
    const arr = new Array(1000).fill(0)

    const [age, setAge] = useState(18)
    if (!i) {
        i = setInterval(() => {
            setAge((age) => age + 1)
            if (age >= 118) {
                console.log(startTime - Date.now())
                clearInterval(i)
            }
        }, 100)
    }


    return (
        <>
            {arr.map((_, index) => (<Children key={index} age={age} />))}
        </>
    )
}


const Children = ({ age }: any) => {
    return (<div>年龄:{age}</div>)
}