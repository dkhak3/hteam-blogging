import React from "react";
import { DropdownProvider } from "./dropdown-context";

const Dropdown = ({ children, error = "", ...props }) => {
  return (
    <DropdownProvider {...props}>
      <div className={`relative inline-block w-full`}>{children}</div>
    </DropdownProvider>
  );
};

export default Dropdown;
