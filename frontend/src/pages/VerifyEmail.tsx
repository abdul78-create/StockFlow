import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import api from "../lib/api";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    api.post("/auth/verify-email", { token })
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Failed to verify email");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-full mx-auto mb-6 flex items-center justify-center bg-white border border-gray-200 shadow-sm">
          {status === "loading" && (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          )}
          {status === "success" && (
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === "error" && (
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {status === "loading" ? "Verifying email..." : 
           status === "success" ? "Email verified" : "Verification failed"}
        </h1>
        
        <p className="text-sm text-gray-500 mb-8">
          {status === "loading" ? "Please wait while we verify your email address." : 
           status === "success" ? "Your email address has been successfully verified." : message}
        </p>

        {(status === "success" || status === "error") && (
          <Link to="/login">
            <Button variant="primary" className="w-full">
              Continue to Login
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
