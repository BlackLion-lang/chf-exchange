"use client";

import { useEffect, useCallback, useState } from "react";
import Script from "next/script";
import { Router } from "lucide-react";
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"


declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    prompt: (callback: (notification: any) => void) => void;
                    cancel: () => void;
                    revoke: (hint: string, callback: () => void) => void;
                };
            };
        };
    }
}

export default function GoogleOneTap() {
    const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
    const router = useRouter()
    const { login } = useAuth()

    const handleCredentialResponse = useCallback(async (response: any) => {
        const token = response.credential;
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Google Email:', payload.email);
        console.log('User Info:', payload);
        const res = await fetch('http://api.robora-dapp.xyz/googlelogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        })

        const data = await res.json();

        if (res.ok) {
            const urlParams = new URLSearchParams(window.location.search);
            login(data.token, true);
            const redirectTo = urlParams.get('redirect') || '/overview';
            router.push(redirectTo);
        } else {
            console.error('Login failed:', res.statusText);
            router.push('/login');
        }

    }, []);

    const initializeGoogleOneTap = useCallback(() => {
        if (window.google) {
            try {
                window.google.accounts.id.initialize({
                    client_id: "796967647932-fn0psent8jpfailcprr8pk1nbtstv65j.apps.googleusercontent.com",
                    callback: handleCredentialResponse,
                    context: "signin",
                    ux_mode: "popup",
                    auto_select: false,
                    use_fedcm_for_prompt: true,
                });

                window.google.accounts.id.prompt((notification: any) => {
                    if (notification.isNotDisplayed()) {
                        console.log(
                            "One Tap was not displayed:",
                            notification.getNotDisplayedReason()
                        );
                    } else if (notification.isSkippedMoment()) {
                        console.log(
                            "One Tap was skipped:",
                            notification.getSkippedReason()
                        );
                    } else if (notification.isDismissedMoment()) {
                        console.log(
                            "One Tap was dismissed:",
                            notification.getDismissedReason()
                        );
                    }
                });
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.message.includes(
                        "Only one navigator.credentials.get request may be outstanding at one time"
                    )
                ) {
                    console.log(
                        "FedCM request already in progress. Waiting before retrying..."
                    );
                    setTimeout(initializeGoogleOneTap, 1000);
                } else {
                    console.error("Error initializing Google One Tap:", error);
                }
            }
        }
    }, [handleCredentialResponse]);

    useEffect(() => {
        if (isGoogleScriptLoaded) {
            initializeGoogleOneTap();
        }
    }, [isGoogleScriptLoaded, initializeGoogleOneTap]);

    return (
        <Script
            src="https://accounts.google.com/gsi/client"
            async
            defer
            onLoad={() => setIsGoogleScriptLoaded(true)}
            strategy="afterInteractive"
        />
    );
}
