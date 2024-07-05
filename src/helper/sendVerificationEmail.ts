import { resend } from "@/lib/resend";
import VerificationEmail from "../../Email/VerificationEmail";
import {ApiResponse} from '../types/ApiResponse';

export async function sendVerificationMessage(
    email : string,
    username : string,
    verifyCode : string 
) : Promise<ApiResponse> {
    console.log("Entered in verifiaction email")
    try {
            await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Hello Heres Your Verification Code',
            react: VerificationEmail({username , otp : verifyCode}),
          });
          console.log("email send");
          return{
            success : true ,
            message : 'OTP Send Successfully'
          }
          
    } catch (error) {
        console.error("Error occured while sending otp",error);
        return {
            success : false ,
            message : "Failed to send OTP"
        }
    }
}