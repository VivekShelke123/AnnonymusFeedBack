"use client";

import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import axios, { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { Message } from "@/model/User";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AcceptMessageSchema } from "@/schema/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCcw } from "lucide-react";
import { MessageCard } from "@/components/MessageCard";


export default function Dashboard() {
    const [message, setMessage] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSwitchLoading, setIsSwitchLoading] = useState(false);

    const { toast } = useToast();

    const handleDeleteMessage = (messageId: string) => {
        setMessage(message.filter((message) => message._id !== messageId))
    }

    const { data: session } = useSession();

    const form = useForm<z.infer<typeof AcceptMessageSchema>>({
        resolver: zodResolver(AcceptMessageSchema),
    })

    const { register, watch, setValue } = form;
    const acceptMessage = watch('acceptMessages');

    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true);
        try {
            const response = await axios.get(`/api/accept-messages`);
            setValue('acceptMessages', response.data.isAcceptinMessages);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Error',
                description:
                    axiosError.response?.data.message ??
                    'Failed to fetch message settings',
                variant: 'destructive',
            });
        } finally {
            setIsSwitchLoading(false);
        }
    }, [setValue, toast]);

    const fetchMessages = useCallback(async (refresh: boolean = false) => {
        setIsLoading(true);
        setIsSwitchLoading(true);
        try {
            const response = await axios.get('api/get-messages');
            setMessage(response.data.messages || []);
            if (refresh) {
                toast({
                    title: 'Refreshed Messages',
                    description: 'showing latest messages'
                })
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Error',
                description:
                    axiosError.response?.data.message ??
                    'Failed to fetch message settings',
                variant: 'destructive',
            });
        } finally {
            setIsSwitchLoading(false);
            setIsLoading(false);
        }

    }, [setIsLoading, setMessage])

    useEffect(() => {
        if (!session || !session.user) return;
        fetchAcceptMessage();
        fetchMessages();
    }, [session, setValue, fetchAcceptMessage, fetchMessages])

    const handleSwitch = async () => {
        try {
            const response = await axios.post('/api/accept-messages', {
                acceptMessage: !acceptMessage,
            });
            setValue('acceptMessages', !acceptMessage);
            toast({
                title: response.data.message,
                variant: 'default',
            })
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Error',
                description:
                    axiosError.response?.data.message ??
                    'Failed to fetch message settings',
                variant: 'destructive',
            });
        }
    }
    if (!session || !session.user) {
        return (
            <div>Please Login</div>
        )
    }

    const { username } = session?.user  as User;

    const baseURL = `${window.location.protocol}//${window.location.host}`;
    const profileURL = `${baseURL}/u/${username}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileURL);
        toast({
            title: "URL copied",
            description: 'profile url has been copied to clipboard'
        })
    }

    

    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
                <div className="flex items-center">
                    <input
                        type="text"
                        value={profileURL}
                        disabled
                        className="input input-bordered w-full p-2 mr-2"
                    />
                    <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>

            <div className="mb-4">
                <Switch
                    {...register('acceptMessages')}
                    checked={acceptMessage}
                    onCheckedChange={handleSwitch}
                    disabled={isSwitchLoading}
                />
                <span className="ml-2">
                    Accept Messages: {acceptMessage ? 'On' : 'Off'}
                </span>
            </div>
            <Separator/>

            <Button
                className="mt-4"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    fetchMessages(true);
                }}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCcw className="h-4 w-4" />
                )}
            </Button>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {message.length > 0 ? (
                    message.map((message, index) => (
                        <MessageCard
                            key={message._id as string}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p>No messages to display.</p>
                )}
            </div>
        </div>
    )
}