import { createContext, use } from "react";

export const NavigationLevelContext = createContext<number>(0);

export const useNavigationLevel = () => {
  return use(NavigationLevelContext);
};
