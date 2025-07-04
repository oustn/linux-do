import React from 'react';
import { Runtime } from '@src/core/runtime.ts';

export const RuntimeContext = React.createContext<Runtime | null>(null);

export function useRuntime() {
  const context: Runtime = React.useContext(RuntimeContext)!;
  return context;
}
