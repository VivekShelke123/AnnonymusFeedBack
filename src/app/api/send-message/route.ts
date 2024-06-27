import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(request : Request){
    await dbConnect();

    try {
        const {username , content } = await request.json();
        
        const user = await UserModel.findOne({username});
    
        if(!user){
            return Response.json({
                success: false,
                message: 'User Not Found',
            }, { status: 404 });
        }
    
        if(!user.isAcceptingMessage){
            return Response.json({
                success: false,
                message: 'User is not Accepting the messages',
            }, { status: 403 });
        }

        const newMessage = {content , createdAt : new Date};
        user.messages.push(newMessage as Message);
        await user.save();
        return Response.json({
            success: true,
            message: 'Message send Successfully',
        }, { status: 200 });
    } catch (error) {
        return Response.json({
            success: false,
            message: 'Failed to send messages',
        }, { status: 500 });
    }
}