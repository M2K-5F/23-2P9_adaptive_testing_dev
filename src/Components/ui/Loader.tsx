import clsx from "clsx"

interface ContainerLoaderProps {
    className?: string
    size?: "sm" | "md" | "lg"
    variant?: "default" | "primary" | "success" | "destructive"
}

export const Loader = ({
    className,
    size = "md",
    variant = "primary",
}: ContainerLoaderProps) => {
    const sizeClasses = {
        sm: "h-8 w-8 border-2",
        md: "h-12 w-12 border-3",
        lg: "h-16 w-16 border-4",
    }

    const variantClasses = {
        default: "border-muted-foreground",
        primary: "border-primary",
        success: "border-green-500",
        destructive: "border-destructive",
    }

    return (
        <div 
            className={clsx(
                "w-full h-full flex items-center justify-center",
                className
            )}
        >
            <div
                className={clsx(
                    "animate-spin rounded-full",
                    sizeClasses[size],
                    variantClasses[variant],
                    "border-t-transparent"
                )}
                style={{ animationDuration: "0.8s" }}
                aria-label="Loading"
            />
        </div>
    )
}