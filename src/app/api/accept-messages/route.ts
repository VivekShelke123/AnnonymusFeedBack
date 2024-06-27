import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { User } from "next-auth";

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);

    const user: User = session?.user;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: 'Not Auhenticated',
        }, { status: 401 });
    }

    const userId = user._id;
    const { acceptMessages } = await request.json();

    try {

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessages },
            { new: true }
        )

        if (!updatedUser) {
            return Response.json({
                success: false,
                message: 'Failed to update user status to update message',
            }, { status: 400 });
        }

        return Response.json({
            success: true,
            message: 'User status updated successfully',
            updatedUser
        }, { status: 200 });

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Failed to update user status to update message',
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);

    const user: User = session?.user;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: 'Not Auhenticated',
        }, { status: 401 });
    }

    try {
        const userId = user._id;

        const foundUser = await UserModel.findById(userId);

        if (!foundUser) {
            return Response.json({
                success: false,
                message: 'Failed to find User',
            }, { status: 400 });
        }

        return Response.json({
            success: true,
            message: 'User Found',
            isAcceptinMessages: foundUser.isAcceptingMessage,
        }, { status: 200 });
    } catch (error) {
        return Response.json({
            success: false,
            message: 'Error geting message acceptance status',
        }, { status: 500 });
    }
}