import React from 'react'
export default function Avatar({username,userId,online}){
    const colors=['bg-teal-200','bg-red-200','bg-green-200','bg-purple-200','bg-blue-200','bg-yellow-200','bg-orange-200'];
    const userIdBase10=parseInt(userId,16);
    const colorIndex=userIdBase10 % colors.length;
    const color=colors[colorIndex];
    return(
        <div className={"relative w-8 h-8 bg-red-200 rounded-full flex items-center "+color}>
            <div className="w-full text-center opacity-70">
                {username[0]}
            </div>
            {online && (
                <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
            )}
            {!online && (
                <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
            )}
        </div>
    );
}