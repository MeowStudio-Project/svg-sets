import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div style={{ padding: "64px 16px", textAlign: "center" }}>
      <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
        This SVG Set could not be found
      </p>
      <Link
        to="/"
        style={{ color: "var(--text)", textDecoration: "underline", fontSize: "0.875rem" }}
      >
        Back
      </Link>
    </div>
  );
}
