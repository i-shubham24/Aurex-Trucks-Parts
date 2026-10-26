import { Component } from "react";
import { useLocation } from "react-router-dom";

/* After a deploy, a tab opened earlier asks for page chunks that no longer exist. */
const CHUNK_ERROR_RX = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Loading (CSS )?chunk [\w-]+ failed|Unable to preload CSS/i;
const isChunkLoadError = (error) =>
  error?.name === "ChunkLoadError" || CHUNK_ERROR_RX.test(String(error?.message || error || ""));

const RELOAD_KEY = "aurex_chunk_reload_at";
/* Reload at most once a minute, so a chunk that is really missing can't loop the tab. */
const reloadForNewVersion = () => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 60000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
};

/* Catches render crashes anywhere below it and shows a recoverable
   screen instead of a blank page. */
class Boundary extends Component {
  state = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error) {
    return { error };
  }

  // Moving to another page gives it a fresh start instead of keeping the error screen.
  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) return { resetKey: props.resetKey, error: null };
    return null;
  }

  componentDidCatch(error, info) {
    if (import.meta.env?.DEV) console.error("[boundary]", error, info?.componentStack);
    if (isChunkLoadError(error)) reloadForNewVersion();
  }

  render() {
    if (this.state.error) {
      const chunk = isChunkLoadError(this.state.error);
      return (
        <main className="grid min-h-screen place-items-center bg-mist px-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-lg">
            <p className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold text-xl font-extrabold text-ink">!</p>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{chunk ? "The site has been updated" : "Something went wrong"}</h1>
            <p className="mt-1.5 text-sm text-steel">
              {chunk
                ? "Reload to get the latest version. Your cart and orders are safe."
                : import.meta.env?.DEV
                ? this.state.error?.message || "The page hit a temporary glitch."
                : "The page hit a temporary glitch. Your cart and orders are safe."}
            </p>
            {import.meta.env?.DEV && this.state.error && (
              <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-red-50 p-3 text-left font-mono text-[11px] text-red-800 border border-red-200">
                {String(this.state.error?.stack || this.state.error)}
              </pre>
            )}
            <div className="mt-5 grid gap-2">
              <button
                onClick={() => {
                  this.setState({ error: null });
                  window.location.reload();
                }}
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

export default function ErrorBoundary({ children }) {
  const { pathname } = useLocation();
  return <Boundary resetKey={pathname}>{children}</Boundary>;
}
