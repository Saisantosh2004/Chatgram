import { useContext, useState } from "react";
import axios from 'axios';
import React from 'react'
import { UserContext } from "./UserContext.jsx";

export default function RegisterAndLoginForm(){

    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [isLogginOrRegister,setIsLogginOrRegister]=useState('register');
    const {setUsername:setLoggedInUsername,setId}=useContext(UserContext);
    async function handleSubmit(ev){
        ev.preventDefault();
        const url=isLogginOrRegister === 'register' ? '/register' : '/login';
        const {data}=await axios.post(url,{username,password});
        console.log(data);
        setLoggedInUsername(username);
        setId(data.id);
    }
    return (
        <div>
            <div className="bg-blue-50 h-screen flex items-center">
                <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                    <div className="bg-blue-50 text-lg mb-3 text-blue-600 flex gap-2 justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                        </svg>
                        MernChat &nbsp;{isLogginOrRegister==='register' ?'Sign Up':'Sign In'}
                    </div>
                    <input type="text" value={username} onChange={ev=>setUsername(ev.target.value)} placeholder="Enter Username" className="block w-full p-2 rounded-sm mb-2 border"/>
                    <input type="text" value={password} onChange={ev=>setPassword(ev.target.value)} placeholder="Enter Password" className="block w-full p-2 rounded-sm mb-2 border"/>
                    <button type='submit' className="bg-blue-500 text-white w-full block rounded-sm p-2">
                        {isLogginOrRegister === 'register'? 'Register' : 'Login' }
                    </button>
                    {isLogginOrRegister === 'register' && (
                    <div className="text-sm text-red-700 text-center mt-2">
                        Already a member?
                        <button onClick={()=>{setIsLogginOrRegister('login')}}>&nbsp;Login Here</button>
                    </div>
                    )}
                    {isLogginOrRegister==='login' && (
                        <div className="text-sm text-red-700 text-center mt-2">
                            Dont have an account? 
                            <button onClick={()=>{setIsLogginOrRegister('register')}}>&nbsp;Register Here</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
        
    );
}