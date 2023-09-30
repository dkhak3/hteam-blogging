import React from "react";
import { useController } from "react-hook-form";
import styled from "styled-components";

const InputStyles = styled.div`
  position: relative;
  width: 100%;
  input {
    width: 100%;
    padding: 16px 20px;
    background-color: transparent;
    border: 1px solid ${(props) => props.theme.grayf1};
    border-radius: 8px;
    transition: all 0.2s linear;
    color: ${(props) => props.theme.black};
    font-size: 14px;
  }
  input::-webkit-input-placeholder {
    color: #b2b3bd;
  }
  input::-moz-input-placeholder {
    color: #b2b3bd;
  }
  .input-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }
`;

const Textarea = ({
  placeholder = "",
  name = "",
  defaultValue = "",
  control,
  children,
  error = "",
  className = "",
  row = "",
  ...props
}) => {
  const { field } = useController({
    control,
    name,
    defaultValue: "",
  });
  return (
    <InputStyles>
      <div className="block">
        <textarea
          rows={row}
          id={name}
          placeholder={placeholder}
          {...field}
          {...props}
          className={
            error
              ? "!border !border-red-500 w-full rounded-lg pt-4 pb-4 pl-4 pr-4"
              : className || ""
          }
        />
        <span
          className={`text-sm font-medium text-red-500 ${
            className ? "mb-6" : ""
          }`}
        >
          {error}
        </span>
        {children ? (
          <div className={`input-icon ${error ? "!top-[35%]" : ""}`}>
            {children}
          </div>
        ) : null}
      </div>
    </InputStyles>
  );
};

export default Textarea;
