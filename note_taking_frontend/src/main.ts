import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { safeToString, withSafeConsole } from './app/core/utils/logging.util';

// Wrap console to guarantee first argument is a string (prevents Node/Vite errors).
withSafeConsole();

bootstrapApplication(AppComponent, appConfig).catch((err) => {
  // Always log string to avoid Node's stripVTControlCharacters receiving undefined
  const msg = safeToString(err);
  console.error(msg);
});
