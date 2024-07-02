'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useCompletion } from 'ai/react';
import { useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
    return messageString.split(specialChar);
};

const initialMessageString =
    "What's your favorite movie?||Do you have any pets?||What's your dream job?";


export default function SendPage() {

    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isSendingFeedback, setIsSendingFeedback] = useState(false);
    const [message1, setmessage1] = useState('');

    const params = useParams<{ username: string }>();
    const username = params.username;

    const { toast } = useToast();


    const handleFeedbackSubmit = async () => {
        setIsSendingFeedback(true);
        try {
            const response = await axios.post('/api/send-message', {
                username,
                content:feedbackMessage
            })
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Error',
                description:
                    axiosError.response?.data.message ?? 'Failed to sent message',
                variant: 'destructive',
            });
        } finally {
            setIsSendingFeedback(false);
        }
    }


    const handleAiSubmit = async () => {
        setIsSendingFeedback(true);
        try {
            const response = await axios.post('/api/suggest-messages');
            setmessage1(response.data);
        } catch (error) {
            toast({
                title : 'error',
                description : 'Some error occured while fetching messages'
            })
        }
    }

    return (
        <div>
            <div className="text-center my-8">
                <p className="text-3xl font-bold">Public Profile Link</p>
            </div>
            <div className="flex justify-center">
                <div className="grid w-[70%] gap-2">
                    <Label>Enter Your Message</Label>
                    <Textarea placeholder="Type your message here." className="border-black border-2" value={feedbackMessage} onChange={e => setFeedbackMessage(e.target.value)} />
                    <Button onClick={handleFeedbackSubmit}>Send message</Button>
                </div>
            </div>
            <Separator className="my-4" />
            <Button onClick={handleAiSubmit}>Generate Random Message</Button>
            <div className="flex justify-center">
                <Card>
                    <CardHeader className="text-center">
                        <h3 className="text-xl font-semibold">Messages</h3>
                    </CardHeader>
                    <CardContent>
                        {
                            parseStringMessages(message1).map((message, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className="mb-2"
                                    onClick={() => setFeedbackMessage(message)}
                                >
                                    {message}
                                </Button>
                            ))
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}