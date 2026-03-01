import React from "react";
import InternalLayout from "@/components/internal/InternalLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }) {
  return (
    <ErrorBoundary>
      <InternalLayout>{children}</InternalLayout>
      <Toaster richColors closeButton />
    </ErrorBoundary>
  );
}