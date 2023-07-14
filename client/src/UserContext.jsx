import React from 'react'
import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext=createContext({});

function UserContextProvider({children}){
    const [username,setUsername]=useState();
    const [id,setId]=useState(null);

    useEffect(()=>{
        axios.get('/profile').then(res=>{
            setId(res.data.userId);
            setUsername(res.data.username);
        })
    },[]);

    return (
        <UserContext.Provider value={{username,setUsername,id,setId}}>
            {children}
        </UserContext.Provider>
    )
}

export default UserContextProvider;