"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

/**
 * Local editable state that resets whenever the upstream `value` reference
 * changes (e.g. the store updates from elsewhere — undo, import, another
 * caregiver's tab). Resets during render rather than in a `useEffect`, per
 * React's recommended pattern for "adjusting state when a prop changes":
 * https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 */
export function useSyncedState<T>(value: T): [T, Dispatch<SetStateAction<T>>] {
  const [prevValue, setPrevValue] = useState(value);
  const [state, setState] = useState(value);

  if (!Object.is(prevValue, value)) {
    setPrevValue(value);
    setState(value);
  }

  return [state, setState];
}
