import * as React from "react";
import { cn } from "../../lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    action?: React.ReactNode;
}

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
    ({ className, title, action, children, ...props }, ref) => (
        <div ref={ref} className={cn("mb-6", className)} {...props}>
            {(title || action) && (
                <div className="mb-2 flex items-center justify-between px-2">
                    {title && (
                        <h3 className="text-sm font-medium uppercase text-tg-hint">
                            {title}
                        </h3>
                    )}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="space-y-2">{children}</div>
        </div>
    )
);
Section.displayName = "Section";

export { Section };
