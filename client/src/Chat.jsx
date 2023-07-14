import { useContext, useEffect, useRef, useState } from "react";

import Logo from "./Logo";
import axios from "axios";
import React from 'react'
import {uniqBy} from "lodash";
import { UserContext } from "./UserContext.jsx";
import Contact from "./Contact";

export default function Chat(){
    const [ws,setWs]=useState(null);
    const [onlinePeople,setOnlinePeople]=useState({});
    const [selectedUserId,setSelectedUserId]=useState(null)
    const [newMessageText,setNewMessageTest]=useState('');
    const [messages,setMessages]=useState([]);
    const [offlinePeople,setOfflinePeople]=useState({});
    const {username,id,setId,setUsername}=useContext(UserContext);
    const divUnderMessages = useRef();

    

    useEffect(()=>{
        connectToWs();
    },[]);

    useEffect(() => {
        const div = divUnderMessages.current;
        if (div) {
          div.scrollIntoView({behavior:'smooth', block:'end'});
        }
    }, [messages]);

    useEffect(()=>{
        if(selectedUserId){
            axios.get('/messages/'+selectedUserId).then(res=>{
                setMessages(res.data);
            })
        }
    },[selectedUserId]);

    useEffect(()=>{
        axios.get('/people').then((res)=>{
            const offlinePeopleArr=res.data.filter(p=>p._id!==id).filter(p=>!Object.keys(onlinePeople).includes(p._id));
            const offlinePeople={};
            offlinePeopleArr.forEach(p=>{
                offlinePeople[p._id]=p;
            })
            // console.log({offlinePeople})
            setOfflinePeople(offlinePeople);
        })
    },[onlinePeople])

    function connectToWs(){
        const ws=new WebSocket('ws://localhost:5000');
        setWs(ws);
        ws.addEventListener('message',handleMessage);
        ws.addEventListener('close',()=>{
            setTimeout(() => {
                console.log('Disconnected. Trying to reconnect.');
                connectToWs();
            }, 100);
        });
    }

    function showOnlinePeople(peopleArr){
        const people={};
        peopleArr.forEach(({userId,username})=> {
            people[userId]=username;
        });
        setOnlinePeople(people);
    }

    function handleMessage(e){
       const messageData=JSON.parse(e.data);
       console.log({e,messageData});
       if('online' in messageData){
        showOnlinePeople(messageData.online);
       }
       else if('text' in messageData){
        if(messageData.sender===selectedUserId){
            setMessages(prev=>([...prev,{
                ...messageData
            }]));
        }
       }
    }

    function sendMessage(ev){
        ev.preventDefault();
        ws.send(JSON.stringify({
            recipient:selectedUserId,
            text: newMessageText,
        }));
        setNewMessageTest('');
        setMessages(prev=>([...prev,{
            text:newMessageText,
            sender:id,
            recipient:selectedUserId,
            _id: Date.now(),
        }]));
    }

    function logout(){
        axios.post('/logout').then(()=>{
            setWs(null)
            setId(null);
            setUsername(null)
        });
    }

    const onlinePeopleExclOurUser={...onlinePeople};
    delete onlinePeopleExclOurUser[id];

    const messagesWithoutDupes=uniqBy(messages,'_id');
    return (
        <div className="flex h-screen">
            <div className="bg-white w-1/3 flex flex-col">
                <div className="flex-grow">
                    <Logo/>
                    {Object.keys(onlinePeopleExclOurUser).map(userId=>(
                        <Contact
                            key={userId}
                            id={userId}
                            username={onlinePeopleExclOurUser[userId]}
                            onClick={()=>setSelectedUserId(userId)}
                            selected={userId===selectedUserId}
                            online={true}
                        />
                    ))}
                    {Object.keys(offlinePeople).map(userId=>(
                        <Contact
                            key={userId}
                            id={userId}
                            username={offlinePeople[userId].username}
                            online={false}
                            onClick={()=>setSelectedUserId(userId)}
                            selected={userId===selectedUserId}
                        />
                    ))}
                </div>
                <div className="p-2 text-center flex items-center justify-center">
                    <span className="mr-2 text text-gray-600 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                            <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" />
                        </svg>
                        {username}
                    </span>
                    <button 
                        onClick={logout}
                        className="text-sm text-gray-500 bg-sky-100 m-1 p-1 border-solid border-2 rounded-md">
                        logout
                    </button>
                </div>
            </div>
            <div className="flex flex-col bg-blue-50 w-2/3 p-2">
                <div className="flex-grow">
                    {!selectedUserId && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-300">&larr; Select a person from the Sidebar</div>
                        </div>
                    )}
                    {!!selectedUserId && (
                        <div className="relative h-full">
                            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                                {messagesWithoutDupes.map(message => (
                                    <div key={message._id} className={(message.sender===id?'text-right':'text-left')}>
                                        <div className={"text-left inline-block p-2 my-2 mr-3 rounded-md text-sm "+(message.sender===id ? 'bg-blue-500 text-white':'bg-white text-gray-500')}>
                                            <div>{message.text}</div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={divUnderMessages}></div>
                            </div>
                        </div>
                    )}
                </div>
                {!!selectedUserId && (
                    <form className="flex gap-2" onSubmit={sendMessage}>
                        <input type="text" 
                            className="flex-grow bg-white border p-2 rounded-sm" 
                            placeholder="Type your message here"
                            value={newMessageText} onChange={ev=>setNewMessageTest(ev.target.value)}
                        />
                        <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}