import { render, screen } from '@testing-library/react';
import { describe, expect, it } from "vitest";
import App from "../App";

describe("example test", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });

  it("renders the app with navigation", () => {
    render(<App />);
    expect(screen.getByText(/airbrb/i)).toBeInTheDocument();
    expect(screen.getByText(/explore/i)).toBeInTheDocument();
  });
});
