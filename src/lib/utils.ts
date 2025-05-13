import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useContextSafe<T>(context: React.Context<T>) {
  const ctx = React.useContext(context);
  if (!ctx) {
    throw new Error("context is null");
  }
  return ctx;
}
