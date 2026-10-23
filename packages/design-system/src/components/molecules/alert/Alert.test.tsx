import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("is a polite status region in the info scheme by default", () => {
    render(<Alert title="Saved">Your changes are live.</Alert>);
    const region = screen.getByRole("status");
    expect(region).toHaveClass("scnx-alert");
    expect(region).toHaveAttribute("data-scheme", "info");
  });

  it("announces assertively only with role alert, in the scheme it is given", () => {
    render(
      <Alert scheme="danger" role="alert" title="Payment failed">
        Check the card and retry.
      </Alert>,
    );
    const region = screen.getByRole("alert");
    expect(region).toHaveAttribute("data-scheme", "danger");
    expect(region).toHaveTextContent("Payment failedCheck the card and retry.");
  });
});
