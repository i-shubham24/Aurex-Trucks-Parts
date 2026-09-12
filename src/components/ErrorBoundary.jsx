import React from "react";
import { Link } from "react-router-dom";
import { TriangleAlert } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F8FA] grid place-items-center p-4">
          <div className="max-w-md bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center shadow-sm">
            <TriangleAlert size={48} className="mx-auto text-[#E53E00] mb-4" />
            <h1 className="font-display font-bold text-2xl text-[#1A1A2E]">Something went wrong</h1>
            <p className="text-sm text-[#6B7280] mt-2">
              We encountered an unexpected error. This has been logged for our team.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/";
              }}
              className="mt-6 bg-[#E53E00] text-white px-6 py-3 rounded-xl font-bold text-sm w-full hover:bg-[#1A1A2E] transition"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
