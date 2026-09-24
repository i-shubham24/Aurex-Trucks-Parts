import { Component } from "react";

/* Catches render crashes anywhere below it and shows a recoverable
   screen instead of a blank page. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env?.DEV) console.error("[boundary]", error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-mist px-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-lg">
            <p className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold text-xl font-extrabold text-ink">!</p>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Something went wrong</h1>
            <p className="mt-1.5 text-sm text-steel">
              The page hit a temporary glitch (often a stale dev reload). Your cart and orders are safe.
            </p>
            <div className="mt-5 grid gap-2">
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-ink py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy"
              >
                Reload the page
              </button>
              <a href="/" className="rounded-lg border border-line-dark py-2.5 text-sm font-bold transition-colors hover:border-navy hover:text-navy">
                Back to home
              </a>
            </div>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
