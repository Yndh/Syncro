"use client";

import { ToastContainer } from "react-toastify";
import { useTheme } from "../providers/ThemeProvider";

export const ToastContainerComponent = () => {
  const { theme } = useTheme();

  return <ToastContainer theme={theme == "dark" ? "dark" : "light"} />;
};
