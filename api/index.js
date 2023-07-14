const express=require('express');
const mongoose=require('mongoose');
const User=require('./models/User');
const dotenv=require('dotenv');
const jwt=require('jsonwebtoken');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const bcrypt=require('bcryptjs');
const ws=require('ws');
const Message = require('./models/Message');


dotenv.config();
const app=express();
app.use(express.json());
app.use(cors({credentials:true,origin:process.env.CLIENT_URL}));
app.use(cookieParser());


const mongoUrl=process.env.MONGO_URL;
const jwtSecret=process.env.JWT_SECRET;
const bcryptSalt=bcrypt.genSaltSync(10);



mongoose.connect(mongoUrl);


function getUserFromRequest(req){
    return new Promise((resolve,reject)=>{
        const token=req.cookies.token
        if(token){
            jwt.verify(token,jwtSecret,{},(err,userData)=>{
                if(err) throw err;
                resolve(userData);
            })
        }
        else{
            reject('no token')
        }
    })
    
}

app.get('/test',(req,res)=>{
    res.json('test ok');
});

app.get('/messages/:userId',async (req,res)=>{
    const {userId}=req.params;
    const userData=await getUserFromRequest(req);
    const ourUserId=userData.userId;
    const messages= await Message.find({
        sender:{$in:[userId,ourUserId]},
        recipient:{$in:[userId,ourUserId]}
    }).sort({createdAt:1})
    res.json(messages);
})

app.get('/people',async (req,res)=>{
    const users=await User.find({},{'_id':1,'username':1});
    res.json(users);
})

app.get('/profile',(req,res)=>{
    const token=req.cookies.token
    if(token){
        jwt.verify(token,jwtSecret,{},(err,userData)=>{
            if(err) throw err;
            res.json(userData); 
        })
    }
    else{
        res.status(401).json('no token');
    }
})

app.post('/login',async (req,res)=>{
    const {username,password}=req.body;
    const foundUser=await User.findOne({username});
    if(foundUser){
        const passOk=bcrypt.compareSync(password,foundUser.password);
        if(passOk){
            jwt.sign({userId:foundUser._id,username},jwtSecret,{},(err,token)=>{
                if (err) throw err;
                res.cookie('token',token,{sameSite:'none',secure:true}).status(201).json({
                    id:foundUser._id,
                    username:username,
                });
            })
        }
    }
});

app.post('/logout',(req,res)=>{
    res.cookie('token','',{sameSite:'none',secure:true}).status(201).json('ok');
})

app.post('/register',async (req,res)=>{
    const {username,password}=req.body;
    try{
        const hashedPassword=bcrypt.hashSync(password,bcryptSalt);
        const createdUser=await User.create(
            {username:username,
            password:hashedPassword,
            });
        jwt.sign({userId:createdUser._id,username},jwtSecret,{},(err,token)=>{
            if (err) throw err;
            res.cookie('token',token,{sameSite:'none',secure:true}).status(201).json({
                id:createdUser._id,
                username:username,
            });
        })
    }
    catch(err){
        if(err) throw err;
        res.status(500).json('error');
    }
});

const server=app.listen(5000);

const wss = new ws.WebSocketServer({server});
wss.on('connection',(connection,req)=>{

    connection.on('headers', (headers) => {
        headers.push('Access-Control-Allow-Origin: ' + process.env.CLIENT_URL);
        headers.push('Access-Control-Allow-Credentials: true');
    });

    function notifyAboutOnlinePeople() {
        [...wss.clients].forEach(client => {
          client.send(JSON.stringify({
            online: [...wss.clients].map(c => ({userId:c.userId,username:c.username})),
          }));
        });
    }

    // connection.isAlive = true;

    // connection.timer = setInterval(() => {
    //     connection.ping();
    //     connection.deathTimer = setTimeout(() => {
    //         connection.isAlive = false;
    //         clearInterval(connection.timer);
    //         connection.terminate();
    //         notifyAboutOnlinePeople();
    //         console.log('dead');
    //     }, 1000);
    // }, 5000);

    // connection.on('pong', () => {
    //     clearTimeout(connection.deathTimer);
    // });


    // read username and id from cookie
    const cookies=req.headers.cookie;
    if(cookies){
        const tokenCookieString=cookies.split(';').find(str=>str.startsWith('token='))
        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1];
            if (token) {
              jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if (err) throw err;
                const {userId, username} = userData;
                connection.userId = userId;
                connection.username = username;
              });
            }
        }
    }

    connection.on('message',async (message)=>{
        messageData=JSON.parse(message.toString());
        const {recipient,text}=messageData;
        const messageDoc=await Message.create({
            text,
            sender:connection.userId,
            recipient,
        })
        console.log(text);
        if(recipient && text){
            [...wss.clients].filter(c=>c.userId===recipient).forEach(c=>c.send(JSON.stringify({text,sender:connection.userId,recipient,_id:messageDoc._id})));
            // [...wss.clients].filter(c=>c.userId===recipient).forEach(c=>c.send(JSON.stringify({text,sender:connection.userId})));
        }
    });
   
    // notify aboutonline people when someone connects
    notifyAboutOnlinePeople();
})




//Q89aPpKTlWQHYwa8

// [...wss.clients].forEach(client=>{
//     client.send(JSON.stringify({
//         online:[...wss.clients].map(c=>({userId:c.userId,username:c.username}))
//     }))
// })