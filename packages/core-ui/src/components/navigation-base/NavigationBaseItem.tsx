import { cloneElement, createContext, useId, useState, type MouseEvent, type ReactElement, type ReactNode, type Ref } from "react";
import { Slot } from "../../utils/Slot";
import { NavigationBaseBadge as Badge } from "./NavigationBaseBadge";
import { NavigationBaseIcon as Icon } from "./NavigationBaseIcon";
import { NavigationBaseItemContent as ItemContent } from "./NavigationBaseItemContent";
import { NavigationBaseText as Text } from "./NavigationBaseText";
import { NavigationBaseTrailingIcon as TrailingIcon } from "./NavigationBaseTrailingIcon";
import { NavigationLevelContext, useNavigationLevel } from "./NavigationLevelContext";
import type { NavigationBaseItemProps } from "./types";

/** The ID the nearest nested group takes, so its disclosure button can control it. */
export const SubgroupIdContext = createContext<string | null>(null);

const cancelActivation = (event: MouseEvent) => event.preventDefault();

/**
 * NavigationBaseItem - one `li` of a navigation group (TDD primitives P8,
 * WAI-ARIA APG Disclosure Navigation Menu).
 *
 * - `href`: a native link; `isActive` sets `aria-current="page"`.
 * - `asChild`: its single child (for example a router Link) becomes the link;
 *   the item's icon, label, and badge replace the child's own children.
 * - `children` (a nested group): a native disclosure button with
 *   `aria-expanded`, and `aria-controls` while the group is shown. No menu
 *   role and no `aria-haspopup`: this is site navigation, not a menu.
 * - neither: an action button.
 *
 * The consumer's onClick runs first; `preventDefault` cancels the toggle.
 *
 * @example
 * ```tsx
 * <NavigationBase.Group>
 *   <NavigationBase.Item href="/reports" label="Reports" isActive />
 *   <NavigationBase.Item label="Payroll">
 *     <NavigationBase.Group>
 *       <NavigationBase.Item href="/payroll/runs" label="Runs" />
 *     </NavigationBase.Group>
 *   </NavigationBase.Item>
 * </NavigationBase.Group>
 * ```
 */
export const NavigationBaseItem = (props: NavigationBaseItemProps): ReactElement => {
  const {
    className,
    iconClassName,
    itemContentClassName,
    textClassName,
    badgeClassName,
    trailingIconClassName,
    style,
    label,
    icon,
    badge,
    trailingIcon,
    children,
    isActive,
    isDisabled = false,
    onClick,
    href,
    asChild,
    isExpanded: controlledExpanded,
    defaultExpanded = false,
    onExpandedChange,
    ref,
    ...rest
  } = props as NavigationBaseItemProps & { href?: string; asChild?: boolean; isExpanded?: boolean; defaultExpanded?: boolean; onExpandedChange?: (expanded: boolean) => void };
  const level = useNavigationLevel();
  const groupId = `${useId()}-group`;
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const { "data-index": dataIndex, ...elementProps } = rest as typeof rest & { "data-index"?: number };

  const content: ReactNode = (
    <>
      {icon && <Icon className={iconClassName}>{icon}</Icon>}
      <ItemContent className={itemContentClassName}>
        <Text className={textClassName}>{label}</Text>
        {badge && <Badge className={badgeClassName}>{badge}</Badge>}
        {trailingIcon && <TrailingIcon className={trailingIconClassName}>{trailingIcon}</TrailingIcon>}
      </ItemContent>
    </>
  );
  const common = {
    ...elementProps,
    className,
    "data-part": "trigger",
    "data-active": isActive || undefined,
    "data-disabled": isDisabled || undefined,
  };

  let element: ReactElement;
  if (asChild) {
    const child = children as ReactElement<{ children?: ReactNode }>;
    const guard = isDisabled ? { "aria-disabled": true, tabIndex: -1, onClick: cancelActivation } : { onClick };
    element = (
      <Slot {...common} ref={ref} aria-current={isActive ? "page" : undefined} {...guard}>
        {cloneElement(child, undefined, content)}
      </Slot>
    );
  } else if (href !== undefined) {
    element = isDisabled ? (
      <a {...common} ref={ref as Ref<HTMLAnchorElement>} aria-disabled tabIndex={-1} onClick={cancelActivation}>{content}</a>
    ) : (
      <a {...common} ref={ref as Ref<HTMLAnchorElement>} href={href} aria-current={isActive ? "page" : undefined} onClick={onClick}>{content}</a>
    );
  } else if (children !== undefined && children !== null) {
    const expanded = controlledExpanded ?? uncontrolledExpanded;
    const toggle = (event: MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (controlledExpanded === undefined) setUncontrolledExpanded(!expanded);
      onExpandedChange?.(!expanded);
    };
    element = (
      <button
        {...common}
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        disabled={isDisabled}
        aria-expanded={expanded}
        aria-controls={expanded ? groupId : undefined}
        data-expanded={expanded}
        onClick={toggle}
      >
        {content}
      </button>
    );
  } else {
    element = (
      <button {...common} ref={ref as Ref<HTMLButtonElement>} type="button" disabled={isDisabled} onClick={onClick}>{content}</button>
    );
  }

  const hasGroup = !asChild && href === undefined && children !== undefined && children !== null;
  return (
    <li data-part="item" style={style} data-index={dataIndex} data-level={level}>
      {element}
      {hasGroup && (
        <NavigationLevelContext value={level + 1}>
          <SubgroupIdContext value={groupId}>{children}</SubgroupIdContext>
        </NavigationLevelContext>
      )}
    </li>
  );
};

NavigationBaseItem.displayName = "NavigationBaseItem";
