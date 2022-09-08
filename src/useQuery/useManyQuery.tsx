import React from 'react';
import { useQuery, useQueryClient } from '../lzy-React-query/index'
import { getUser, queryFnSuccess, queryFnFail, queryFnUndefined } from './queryFn'
import { useState } from 'react';




function UseQuery({ queryKey }: any) {
    const { data, status, isStale, refetch } = useQuery([queryKey], getUser)
    const queryClient = useQueryClient()
    const [num, setNum] = useState(0)


    const getAllQueryData = () => {
        const querys = queryClient.getAllQueryData()
        console.log(querys);
    }
    return (
        <div>
            <h1>{queryKey}</h1>
            <div>数据:{data?.data},状态为:{status},是否新鲜:{isStale().toString()}</div>
            <button onClick={() => { setNum(num + 1) }}>num++{num}</button>
            <button onClick={refetch}>Refetch</button>
            <button onClick={getAllQueryData}>getAllQueryData</button>
        </div>
    );
}

export default function UseManyQuery() {
    return (
        <>
            <UseQuery queryKey='Query_1' />
            <UseQuery queryKey='Query_2' />
            <UseQuery queryKey='Query_3' />
            <UseQuery queryKey='Query_4' />
            <UseQuery queryKey='Query_5' />
        </>
    )
}








