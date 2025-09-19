import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { safeToString, withSafeConsole } from './app/core/utils/logging.util';

// Apply safe console wrappers early in SSR context.
withSafeConsole();

const bootstrap = () => bootstrapApplication(AppComponent, config);

// PUBLIC_INTERFACE
export default function bootstrapWithSafeLogging() {
  /** Default SSR bootstrap that logs any error as a safe string. */
  try {
    return bootstrap();
  } catch (err) {
    // Ensure error is stringified before logging/propagation.
    const msg = safeToString(err);
    console.error(msg);
    throw err;
  }
}
