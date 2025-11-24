import * as React from "react";
import { cn } from "../../lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "ghost" | "destructive";
    size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileTap={{ opacity: 0.7, scale: 0.98 }}
                transition={{ duration: 0.1 }}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-tg-button text-tg-button-text": variant === "primary",
                        "bg-tg-secondary text-tg-text": variant === "secondary",
                        "hover:bg-tg-secondary/80 text-tg-text": variant === "ghost",
                        "bg-red-500 text-white": variant === "destructive",
                        "h-8 px-3 text-xs": size === "sm",
                        "h-10 px-4 py-2": size === "md",
                        "h-12 px-6 text-lg": size === "lg",
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
