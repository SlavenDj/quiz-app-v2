import { forwardRef } from "react";
import { Input, type InputProps } from "./Input";

export interface TextInputProps extends InputProps {
  label?: string;
  error?: string;
}

/**
 * Backwards-compatible alias for the old TextInput.
 * New code should import { Input } from "./Input" (or from "../ui").
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  props,
  ref
) {
  return <Input ref={ref} {...props} />;
});
