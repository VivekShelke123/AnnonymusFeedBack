"use client";

import axios, { AxiosError } from "axios";
import * as z from 'zod';
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { verifySchema } from "@/schema/verifySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";


export default function VerificationPage() {

    const router = useRouter();
    const params = useParams();

    const { toast } = useToast();

    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
    })

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        try {
            const response = await axios.post(`/api/verifyCode`, {
                username: params.username,
                code: data.code
            })
            if (response.data.success) {
                toast({
                    title: "Success",
                    description: response.data.message
                })
                router.replace('/sign-in');            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Verification Failed',
                description:
                    axiosError.response?.data.message ??
                    'An error occurred. Please try again.',
                variant: 'destructive',
            });
        }
    }
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Verify Your Account
                    </h1>
                    <p className="mb-4">Enter the verification code sent to your email</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            name="code"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter Code Here"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="mt-3">
                            Verify
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}