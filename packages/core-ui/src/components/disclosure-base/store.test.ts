import { describe, expect, it, vi } from "vitest";
import { createDisclosureStore, type DisclosureStoreConfig } from "./store";

const config = (over: Partial<DisclosureStoreConfig> = {}): DisclosureStoreConfig => ({
  type: "multiple",
  collapsible: true,
  disabled: false,
  value: undefined,
  ...over,
});

describe("disclosure store", () => {
  it("applies two intents made in the same tick (the reproduced baseline race)", () => {
    const store = createDisclosureStore(config());
    store.register("a", {});
    store.register("b", {});
    store.request("a", true);
    store.request("b", true);
    store.request("a", false);
    store.request("b", false);
    expect([store.isOpen("a"), store.isOpen("b")]).toEqual([false, false]);
  });

  it("does not let a stale cleanup remove a newer registration of the same value", () => {
    const store = createDisclosureStore(config());
    const first = store.register("a", {});
    first.unregister();
    const second = store.register("a", {});
    first.unregister(); // late cleanup from the first generation
    expect(store.values()).toEqual(["a"]);
    second.unregister();
    expect(store.values()).toEqual([]);
  });

  it("rejects a duplicate live value", () => {
    const store = createDisclosureStore(config());
    expect(store.register("a", {}).accepted).toBe(true);
    expect(store.register("a", {}).accepted).toBe(false);
  });

  it("single: opening B closes A, with one callback per accepted change", () => {
    const onValueChange = vi.fn();
    const store = createDisclosureStore(config({ type: "single", onValueChange }), ["a"]);
    const a = vi.fn();
    const b = vi.fn();
    store.register("a", { onOpenChange: a });
    store.register("b", { onOpenChange: b });
    expect(store.request("b", true)).toBe(true);
    expect([store.isOpen("a"), store.isOpen("b")]).toEqual([false, true]);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(["b"]);
    expect(a).toHaveBeenCalledWith(false);
    expect(b).toHaveBeenCalledWith(true);
    expect(store.request("b", true)).toBe(false);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("single, not collapsible: the open item cannot close; another can open", () => {
    const store = createDisclosureStore(config({ type: "single", collapsible: false }), ["a"]);
    expect(store.request("a", false)).toBe(false);
    expect(store.isOpen("a")).toBe(true);
    expect(store.request("b", true)).toBe(true);
  });

  it("rejects intents for a disabled root or item", () => {
    const store = createDisclosureStore(config({ disabled: true }));
    expect(store.request("a", true)).toBe(false);
    store.config = config();
    expect(store.request("a", true, { itemDisabled: true })).toBe(false);
    expect(store.isOpen("a")).toBe(false);
  });

  it("controlled: reports the accepted intent and waits for the prop", () => {
    const onValueChange = vi.fn();
    const store = createDisclosureStore(config({ value: [], onValueChange }));
    const listener = vi.fn();
    store.subscribe(listener);
    expect(store.request("a", true)).toBe(true);
    expect(onValueChange).toHaveBeenCalledWith(["a"]);
    expect(store.isOpen("a")).toBe(false);
    expect(listener).not.toHaveBeenCalled();
    store.config = config({ value: ["a"], onValueChange });
    expect(store.isOpen("a")).toBe(true);
  });

  it("uses an item's default until its state is first set", () => {
    const store = createDisclosureStore(config({ type: "single" }));
    store.register("a", { defaultOpen: true });
    store.register("b", {});
    expect(store.isOpen("a")).toBe(true);
    store.request("b", true);
    expect([store.isOpen("a"), store.isOpen("b")]).toEqual([false, true]);
  });
});
