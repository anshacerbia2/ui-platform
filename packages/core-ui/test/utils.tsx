import type { RenderOptions, RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';

/**
 * Custom render function with common providers
 * Extend this as needed when you add context providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  function Wrapper({ children }: { children: ReactNode }) {
    // Add your providers here as needed
    // Example:
    // return (
    //   <ThemeProvider>
    //     <I18nProvider>
    //       {children}
    //     </I18nProvider>
    //   </ThemeProvider>
    // );
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Create a mock ref object
 */
export function createMockRef<T>(value: T | null = null) {
  return { current: value };
}

/**
 * Wait for next tick (useful for async operations)
 */
export function waitForNextTick() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Create a mock HTMLElement with common properties
 */
export function createMockElement(overrides: Partial<HTMLElement> = {}) {
  const element = document.createElement('div');
  Object.assign(element, overrides);
  return element;
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
