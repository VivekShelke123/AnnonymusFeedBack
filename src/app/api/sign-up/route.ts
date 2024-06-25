import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcrypt";
import { sendVerificationMessage } from "@/helper/sendVerificationEmail";

export async function POST(req:Request) {
    await dbConnect();

    try {
        const {username , email , password } = await req.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username : username,
            isVerified : true
        });
        if(existingUserVerifiedByUsername){
            return Response.json({
                success : false,
                message : "UserName Already Taken"
            },
            {status:400}
            );
        }

        const existingUserVerifiedByEmail = await UserModel.findOne({email});
        const verifyCode = Math.floor(Math.random()*900000 + 100000).toString();


        if(existingUserVerifiedByEmail){
            if(existingUserVerifiedByEmail.isVerified){
                return Response.json({
                    success : false,
                    message : "Email Already Used"
                },
                {status:400}
                );
            }
            else{
                const hashedPass = await bcrypt.hash(password , 10);
                existingUserVerifiedByEmail.password = hashedPass;
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserVerifiedByEmail.save();
            }
        }
        else{
            const hashedPass = await bcrypt.hash(password , 10);

            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPass,
                verifyCode:verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages:[]
            })
            await newUser.save();

        }

        const emailResponse = await  sendVerificationMessage(
                email,
                username,
                verifyCode
        )

        if(!emailResponse.success){
            return Response.json({
                success : false,
                message : emailResponse.message
            },
            {status:500}
            );
        }
        return Response.json({
            success : true,
            message : "User Registered Successfully. Please verify your account"    
        },
        {status:500}
        );
        
    } catch (error) {
        console.error("error Occured while Sign-Up",error);
        return Response.json({
            success : false,
            message : "Error Occured while Sign-Up"
        },
        {status:500}
        );
    }
}
