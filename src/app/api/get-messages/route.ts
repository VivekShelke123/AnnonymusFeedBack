import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request:Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);

    const user: User = session?.user;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: 'Not Auhenticated',
        }, { status: 401 });
    }


    const username = user.username;
    try {
        const data =await UserModel.aggregate([
            {$match : {username : username}},
            {$unwind : "$messages"},
            {$sort : {' messages.createdAt':-1}},
            {$group : {_id : '$_id',messages:{$push:'$messages'}}}, 
        ]);
        if(!data || data.length === 0){
            return Response.json({
                success: false,
                message: 'No Message till Now',
            }, { status: 200 });
        }

        return Response.json({
            success: true,
            message: 'User Found',
            messages : data[0].messages,
        }, { status: 200 });

    } catch (error) {
        console.error(error);
        return Response.json({
            success: false,
            message: 'Some Error Occured',
        }, { status: 500 });

    }


}