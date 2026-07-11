import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import api from "../lib/api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await api.post("/auth/forgot-password", { email });
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-gray-900 rounded-md flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm tracking-tighter">SF</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Reset your password</h1>
          <p className="text-sm text-gray-500 mt-2">Enter your email and we'll send you a reset link.</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          {status === "success" ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Check your email</h3>
              <p className="text-sm text-gray-500 mt-1">We sent a password reset link to {email}</p>
              <Button 
                variant="secondary" 
                className="w-full mt-6"
                onClick={() => { setStatus("idle"); setEmail(""); }}
              >
                Try another email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === "error" && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                  {message}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email address</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>
              
              <Button type="submit" variant="primary" className="w-full" isLoading={status === "loading"}>
                Send reset link
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
