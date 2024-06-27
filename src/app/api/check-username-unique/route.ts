import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from "zod";
import { usernameValidation } from "@/schema/signUpSchema";

const usernameQuerySchema = z.object({
    username : usernameValidation,
})

export async function GET(req:Request) {
    await dbConnect();

    try {
        const {searchParams} = new URL(req.url);
        const queryParams = {
            username:searchParams.get("username")
        };
        
        //validating using Zod
        const result = usernameQuerySchema.safeParse(queryParams);

        if(!result.success){
            const result_error = result.error.format().username?._errors || [];
            return Response.json({
                success : false,
                message : result_error,
            },{status : 400});
        }

        const {username} = result.data;

        const existingVerifiedUser = await UserModel.findOne({username,isVerified:true});

        if(existingVerifiedUser){
            return Response.json({
                success : false,
                message : "Username Already Taken"
            },{status : 400});
        }
        return Response.json({
            success : true,
            message : "Username is Unique"
        },{status : 200});

    } catch (error) {
        console.log("Error checking username",error);
        return Response.json({
            success : false,
            message : "Error checking username"
        },{status : 500});
    }
}