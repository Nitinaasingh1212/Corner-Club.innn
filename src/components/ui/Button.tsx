import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "soft" | "ghost" | "outline";
    size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                    {
                        "bg-[#f98109] text-white hover:bg-[#d66e06] shadow-sm": variant === "primary",
                        "bg-[#f98109]/10 text-[#f98109] hover:bg-[#f98109]/20": variant === "soft",
                        "hover:bg-white text-zinc-900 border border-transparent hover:border-zinc-200 dark:text-zinc-100 dark:hover:bg-zinc-800": variant === "ghost",
                        "border border-zinc-200 bg-transparent hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-800": variant === "outline",
                        "h-9 px-4 text-sm": size === "sm",
                        "h-10 px-5 text-base": size === "md",
                        "h-12 px-6 text-lg": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
