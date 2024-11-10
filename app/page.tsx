"use client";
import { init } from "@instantdb/react";
import { useState, useTransition } from "react";
import CoreApp from "@/components/coreApp";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  ToastAction,
} from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { CurvedBackground } from "@/components/CurvedBackground";

const APP_ID = "d8419df9-903c-4b0a-b501-534596976600";
const db = init({ appId: APP_ID });

export default function Home() {
  const { isLoading, user, error } = db.useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E0] relative flex-col gap-4">
        <div className="absolute inset-0 z-0">
          <CurvedBackground />
        </div>
        <motion.div
          className="w-full flex justify-center"
          style={{ zIndex: 50 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            damping: 8,
            stiffness: 100,
            delay: 0.7,
          }}
        >
          <img
            src="/character/idle.gif"
            alt="Centered Image"
            className="w-[128px]"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-medium z-50"
        >
          Loading...
        </motion.div>
      </div>
    );
  }
  if (error) {
    return <div>Uh oh! {error.message}</div>;
  }
  if (user) {
    return <CoreApp />;
  }
  return <Login />;
}

function Login() {
  const [sentEmail, setSentEmail] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F1E0] relative flex-col gap-4">
      <div className="absolute inset-0 z-0">
        <CurvedBackground />
      </div>
      <motion.div
        className="w-full flex justify-center"
        style={{ zIndex: 50 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          damping: 8,
          stiffness: 100,
          delay: 0.7,
        }}
      >
        <img
          src="/character/idle.gif"
          alt="Centered Image"
          className="w-[128px]"
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {!sentEmail ? (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="z-30"
          >
            <Card className="w-[350px] z-30">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome to Widget!</CardTitle>
                <CardDescription className="text-md">
                  To sign up or sign in, enter your email to receive a magic
                  code!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Email setSentEmail={setSentEmail} />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="code"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="z-30"
          >
            <Card className="w-[350px] z-30">
              <CardHeader>
                <CardTitle className="text-2xl">Enter Code</CardTitle>
                <CardDescription className="text-md">
                  We sent a magic code to {sentEmail}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MagicCode sentEmail={sentEmail} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Email({ setSentEmail }: { setSentEmail: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    startTransition(async () => {
      try {
        await db.auth.sendMagicCode({ email });
        setSentEmail(email);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.body?.message || "Failed to send code",
        });
        setSentEmail("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Code
      </Button>
    </form>
  );
}

function MagicCode({ sentEmail }: { sentEmail: string }) {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await db.auth.signInWithMagicCode({ email: sentEmail, code });
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.body?.message || "Invalid code",
        });
        setCode("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Magic Code</Label>
        <Input
          id="code"
          type="text"
          placeholder="123456..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isPending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Verify Code
      </Button>
    </form>
  );
}
