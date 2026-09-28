import { createContext } from "../../utils/create-context";
import type { TableOfContentsContextValue } from "./types";

export const [TableOfContentsContext, useTableOfContents] =
  createContext<TableOfContentsContextValue>("TableOfContents");
