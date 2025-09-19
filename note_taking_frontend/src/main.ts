import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Safely convert unknown errors to a string to avoid passing undefined to loggers.
 */
function safeErrorToString(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.stack || err.message || String(err);
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

bootstrapApplication(AppComponent, appConfig).catch((err) => {
  // Always log string to avoid Node's stripVTControlCharacters receiving undefined
  const msg = safeErrorToString(err);
  console.error(msg);
});
