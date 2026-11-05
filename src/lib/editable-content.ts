import type { ReactNode } from "react";

/**
 * A page's content where each piece of text may also be any React node. Public pages pass plain
 * strings; the admin panel passes editable elements, so both draw the page with the same components.
 * Fixed string choices (such as a plan id) stay as they are.
 */
export type Nodes<T> = T extends string
  ? string extends T
    ? ReactNode
    : T
  : T extends readonly (infer U)[]
    ? Nodes<U>[]
    : T extends object
      ? { [K in keyof T]: Nodes<T[K]> }
      : T;
