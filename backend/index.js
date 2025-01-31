const express = require('express');
const app= express()
require('dotenv').config();
 require('./models/db');
const bodyParser= require('body-parser')
const cors=require('cors')
const authRouter=require('./routes/AuthRouter')
require('dotenv').config()

const PORT= process.env.PORT || 3000;
 
app.get('/ping',(req,res)=>{
    res.send("PONG")
})

app.use(bodyParser.json());
app.use(cors());
app.use('/auth',authRouter);

app.listen(PORT,()=>{

    console.log(`server is running on ${PORT}`)

})