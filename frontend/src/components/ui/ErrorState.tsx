import { AlertCircle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "./Button";

export function ErrorState({ 
  title = "Something went wrong", 
  message, 
  onRetry,
  className 
}: { 
  title?: string; 
  message?: string; 
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("p-8 text-center flex flex-col items-center justify-center space-y-4", className)}>
      <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        {message && <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
