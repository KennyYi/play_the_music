import React from "react";
import { cn } from "@/lib/utils";

export const ControlButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  loading?: boolean;
  loadingIcon?: React.ReactNode;
  variant?: "default" | "primary";
}> = ({ onClick, icon, disabled = false, variant, loading, loadingIcon }) => {
  return (
    <div
      onClick={disabled || loading ? undefined : onClick}
      className={cn(
        "inline-flex p-2 rounded-md border",
        disabled
          ? "cursor-not-allowed bg-gray-300 text-gray-600"
          : "cursor-pointer hover:bg-slate-50",
        variant === "primary" && "bg-green-700 text-white hover:bg-lime-600"
      )}
    >
      {loading && loadingIcon ? (
        <div className="animate-spin">{loadingIcon}</div>
      ) : (
        icon
      )}
    </div>
  );
};
