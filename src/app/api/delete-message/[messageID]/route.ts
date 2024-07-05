import dbConnect from "@/lib/dbConnect";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import UserModel from "@/model/User";

export async function DELETE(request:Request , {params}:{params : { messageID : string}}) {
    await dbConnect();

    const messageID = params.messageID;
    const session =  await getServerSession(authOptions);
    const _user  : User = session?.user ; 

    if(!session || !_user){
        return Response.json({
            success : false,
            message : "User Is not Authorize"
        },{status : 401});
    }

    try {
        const response = await UserModel.updateOne(
            {_id:_user._id},
            {
                $pull : {messages :{_id : messageID}}
            }
        )

        if(response.modifiedCount === 0){
            return Response.json({
                success : false,
                message : "Message Not Found Or Already Deleted"
            },{status : 404})
        }

        return Response.json(
            { message: 'Message deleted', success: true },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            { message: 'Error deleting message', success: false },
            { status: 500 }
          );
    }
}