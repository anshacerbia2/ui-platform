import type { ReactElement, ReactNode } from "react";
import { Children, Fragment, isValidElement } from "react";

export const flattenChildren = (children: ReactNode): ReactNode[] => {
  const result: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      if (child !== null && child !== undefined) {
        result.push(child);
      }
      return;
    }

    const parseType = child.type;
    const isFragment = 
      child.type === Fragment || 
      (typeof parseType === "symbol" && String(parseType) === "Symbol(react.fragment)");

    if (isFragment) {
      const element = child as ReactElement<any>;
      result.push(...flattenChildren(element.props.children));
    } else {
      result.push(child);
    }
  });
  return result;
};
