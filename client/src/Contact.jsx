import Avatar from "./Avatar";
export default function Contact({id,username,onClick,selected,online}) {
    return (
        <div key={id} onClick={() => { onClick(id) }}
            className={"border-b border-gray-100 flex items-center gap-2 cursor-pointer " + (selected ? 'bg-blue-50' : '')}>
            {selected && (
                <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
            )}
            <div className="flex gap-2 py-2 pl-4 items-center">
                <Avatar online={online} username={username} userId={id} />
                <span className="text-gray-900">{username}</span>
            </div>
        </div>
    )
}



{/* <div key={userId} onClick={()=>{setSelectedUserId(userId)}} 
                    className={"border-b border-gray-100 flex items-center gap-2 cursor-pointer "+(userId===selectedUserId ?'bg-blue-50':'')}>
                        {userId===selectedUserId && (
                            <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
                        )}
                        <div className="flex gap-2 py-2 pl-4 items-center">
                            <Avatar online={true} username={onlinePeople[userId]} userId={userId}/>
                            <span className="text-gray-900">{onlinePeople[userId]}</span>
                        </div>    
                    </div> */}