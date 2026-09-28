import type { ComponentPropsWithRef, ReactNode } from "react";

export type NavigationBarBaseRootProps = Omit<ComponentPropsWithRef<"header">, "ref">;

export type NavigationBarBaseStartProps = Omit<ComponentPropsWithRef<"div">, "ref">;

export type NavigationBarBaseCenterProps = Omit<ComponentPropsWithRef<"div">, "ref">;

export type NavigationBarBaseEndProps = Omit<ComponentPropsWithRef<"div">, "ref">;

export type NavigationBarBaseNavProps = {
  children: ReactNode;
};
