import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function to conditionally join class names and resolve conflicting Tailwind CSS classes.
 * It uses `clsx` to handle conditional classes and `tailwind-merge` to merge them correctly.
 * @param inputs A list of class names or conditional class objects.
 * @returns A single string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
