//
// Logging and error stringification utilities to ensure only strings reach log sinks.
//

// PUBLIC_INTERFACE
export function safeToString(value: unknown): string {
  /** Safely converts any unknown value into a string representation. */
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.stack || value.message || String(value);
  try {
    return JSON.stringify(value);
  } catch {
    try {
      return String(value);
    } catch {
      return 'Unknown error';
    }
  }
}

// PUBLIC_INTERFACE
export function withSafeConsole(): void {
  /**
   * Wraps global console methods to ensure first argument is always a string.
   * This prevents Node/Vite internals (e.g., stripVTControlCharacters) from receiving undefined.
   */
  if (typeof globalThis === 'undefined') return;
  const g: any = globalThis as any;
  if (!g || !g.console) return;

  const methodNames = ['error', 'warn', 'info', 'log', 'debug'] as const;
  type MethodName = typeof methodNames[number];

  const wrap = (fnName: MethodName) => {
    const original = g.console?.[fnName];
    if (typeof original !== 'function') return;
    g.console[fnName] = function (...args: unknown[]) {
      if (args.length === 0) return original.call(this);
      const [first, ...rest] = args;
      const firstStr = safeToString(first);
      return original.call(this, firstStr, ...rest);
    };
  };

  // Common console methods to wrap
  methodNames.forEach(wrap);
}
