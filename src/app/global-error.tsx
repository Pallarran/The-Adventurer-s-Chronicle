"use client";

// Catches errors in the root layout itself — must render its own <html>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#0a0a0f", color: "#e8e6e3" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <div>
            <h2 style={{ marginBottom: "0.5rem" }}>Something went wrong</h2>
            <p style={{ marginBottom: "1.5rem", opacity: 0.7, fontSize: "0.9rem" }}>
              The app hit an unexpected error.
              {error.digest ? ` (ref: ${error.digest})` : ""}
            </p>
            <button
              onClick={reset}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid #c9aa55",
                background: "transparent",
                color: "#c9aa55",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
