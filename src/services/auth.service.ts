// import { createUser, findUserByEmail } from "../repo/user.repo";
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// export const registerFun = async (data:{email:string,password:string,username:string})=>{
//     console.log("data - resg " , data.email , data.password , data.username);
//     // let {email , password , username } = data;
//     // let existingUser = await findUserByEmail(email);

//     // if (existingUser) {
//     //     return { message: "User already exists" };
//     // }
//     // const hashedPassword = await bcrypt.hash(password, 10);
//     // let editResponse = {
//     //     username,
//     //     email,
//     //     password:hashedPassword
//     // }
// //    let userResult = await  createUser(editResponse)
// //    if(userResult){
// //     return {
// //         message:"user created successfully"
// //     }else{
// //         return {
// //              message:"Something wet wrong "
// //         }
//     // }
// //    }
// }