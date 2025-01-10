import * as React from "react"
import { cn } from "@/lib/utils"
import {noto_Sans} from "@/components/ui/fonts"


export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> { }


const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
					className
				)}
				ref={ref}
				{...props}
			/>
		)
	}
)
Input.displayName = "Input"

const Input2 = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex h-full w-full bg-transparent py-1 text-5xl transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed",
					className
				)}
				ref={ref}
				{...props}
			/>
		)
	}
)
Input.displayName = "Input"


export { Input, Input2 }
