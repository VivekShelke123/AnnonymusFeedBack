import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request:Request) {
    await dbConnect();

    try {
        const {username , code} = await request.json();

        const user = await UserModel.findOne({username});
        
        if(!user){
            return Response.json({
                success : false,
                message : "User ot Found"
            },{status : 404});
        }
        
        const isCodeValid = code === user.verifyCode;
        const isCodeExpired = new Date(user.verifyCodeExpiry) > new Date();

        if(isCodeValid && isCodeExpired){
            user.isVerified = true;
            await user.save();

            return Response.json({
                success : true,
                message : "Account Successfully Verified"
            },{status : 200});
        }else{
            if(!isCodeExpired){
                return Response.json({
                    success : false,
                    message : "Verification code is expired"
                },{status : 400});
            }

            if(!isCodeValid){
                return Response.json({
                    success : false,
                    message : "Verification code is not Valid"
                },{status : 500});
            }
        }

    } catch (error) {
        console.log("Error Verifying Code",error);
        return Response.json({
            success : false,
            message : "Error erifying Code"
        },{status : 500});
    }

}