import { renderWithProviders } from "@test/utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  NavigationBase,
  NavigationBaseGroup,
  NavigationBaseItem,
  NavigationBaseRoot,
} from "./index";

describe("navigationBase - Basic Tests", () => {
  describe("named Exports", () => {
    it("renders NavigationBaseRoot", () => {
      renderWithProviders(
        <NavigationBaseRoot>
          <div>Content</div>
        </NavigationBaseRoot>
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("renders NavigationBaseGroup with NavigationBaseItem", () => {
      renderWithProviders(
        <NavigationBaseRoot>
          <NavigationBaseGroup>
            <NavigationBaseItem label="Test Item" />
          </NavigationBaseGroup>
        </NavigationBaseRoot>
      );

      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getByText("Test Item")).toBeInTheDocument();
    });
  });

  describe("compound Export", () => {
    it("renders using NavigationBase.Root", () => {
      renderWithProviders(
        <NavigationBase>
          <div>Content</div>
        </NavigationBase>
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("renders using compound API", () => {
      renderWithProviders(
        <NavigationBase>
          <NavigationBase.Group>
            <NavigationBase.Item label="Home" />
            <NavigationBase.Item label="About" />
          </NavigationBase.Group>
        </NavigationBase>
      );

      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("About")).toBeInTheDocument();
    });

    it("injects data-index attribute", () => {
      renderWithProviders(
        <NavigationBase>
          <NavigationBase.Group>
            <NavigationBase.Item label="Item 1" />
            <NavigationBase.Item label="Item 2" />
          </NavigationBase.Group>
        </NavigationBase>
      );

      const items = screen.getAllByRole("listitem");
      expect(items[0]).toHaveAttribute("data-index", "0");
      expect(items[1]).toHaveAttribute("data-index", "1");
    });

    it("applies custom className", () => {
      renderWithProviders(
        <NavigationBase className="custom-nav">
          <div>Content</div>
        </NavigationBase>
      );

      expect(screen.getByRole("navigation")).toHaveClass("custom-nav");
    });
  });
});
