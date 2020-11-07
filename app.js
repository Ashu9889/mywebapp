//jshint esversion:6
const express =require("express");
const bodyparser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");

const app=express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));

//  Database connection

mongoose.connect("mongodb://localhost:27017/UserDB",{useNewUrlParser:true});

const userSchema=new mongoose.Schema({
    email:String,
    password:String,
    name:String,
    age:Number,
    gender:String,
    pin:Number
});
const secret="this is secret";

const User=new mongoose.model("User",userSchema);



app.get("/",function(req,res){
    res.render("home")
});

app.get("/login",function(req,res){
    res.render("login",{err:"",success_message:""});
});


app.get("/register",function(req,res){
    res.render("register",{err:"",success_message:""});
});

app.get("/logout",function(req,res){
    res.render("home");
});
app.get("/submit/:email",function(req,res){
 
    res.render("submit",{email:req.params.email,err:"",success_message:""});
});

app.get("/forgot",function(req,res){
    label="Email";
    res.render("forgot",{lb:label,lp:"",err:"",success_message:""});
})

//    --------------post request-------- 

app.post("/forgot",function(req,res){
res.render("success",{email:req.body.email})

});
app.post("/success",function(req,res){

    User.update({email:email},{$set:{ password:req.body.new}}
        , function(err){
            if(err)
            {console.log(err);}
           
        });
        res.render("home");
});


app.post("/register",function(req,res){
const newuser=User({
 email:req.body.username,
 password:req.body.password,
 name:"",
 age:"",
 gender:"",
 pin:req.body.pin,
});
if(req.body.username==="" || req.body.password===""||req.body.pin==="")
    {
        error="All fields are mandatory";
        res.render("register",{err:error,success_message:""});
    }
   

User.findOne({email:req.body.username},function(err,founduser){

    msg="";
    if(err){console.log(err);}
    else{
        if(founduser){
           {
                msg="Email ID already in use !!";
                res.render("register",{err:msg,success_message:""});
            }
        }else  if(req.body.password.length<8){
            error="Password should be atleast 8 characters";
            res.render("register",{err:error,success_message:""});
        }else{
            msg="Registration Successfull";
            newuser.save(function(err){
                if(err)
                {
                    console.log(err);
                }
            });
            res.render("login",{success_message:msg,err:""});;
        }
    }
});

});

app.post("/login",function(req,res){
    const email=req.body.username;
    const password=req.body.password;
    if(email==="" || password==="")
    {
        error="All fields are mandatory";
        res.render("login",{err:error,success_message:""});
    }
   

    User.findOne({email:email},function(err,founduser){
        error="";
        if(err){console.log(err);}
        else{
            if(founduser){
                if(founduser.password===password){
                    res.render("secrets",{email:founduser.email,name:founduser.name,age:founduser.age,gender:founduser.gender});
                }else{
                    error=" Wrong Password";
                    res.render("login",{err:error,success_message:""});
                }
            }else{
                error="User not found";
                res.render("login",{err:error,success_message:""});
            }
        }
    });
});

app.post("/submit",function(req,res){
    console.log(req.body.email);
    if(req.body.name===""||req.body.age===""||req.body.gender==="")
    {
        error="All fields are mandatory";
        res.render("submit",{email:req.body.email,err:error,success_message:""});
    }
    User.update({email:req.body.email},{$set:{ name:req.body.name,age:req.body.age,gender:req.body.gender}}
        , function(err){
            if(err)
            {console.log(err);}
           
        });
       res.render("secrets",{email:req.body.email,name:req.body.name,age:req.body.age,gender:req.body.gender});
       
      
});

app.listen(3000,function(){
    console.log("Server running on port 3000");
});