import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  /** This is a public function. */
  get apiBaseUrl(): string {
    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);
    // Try meta tag override (can be set at runtime) - only in browser
    if (isBrowser) {
      const doc = inject(DOCUMENT);
      const meta = doc.querySelector('meta[name="NG_APP_API_BASE_URL"]') as any;
      const fromMeta = meta?.content?.trim?.();
      if (fromMeta) return this.trimTrailingSlash(fromMeta);
      // Fallback to window env injection if available
      let fromRuntime: string | undefined;
      const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : undefined;
      if (g && typeof g.NG_APP_API_BASE_URL === 'string') {
        fromRuntime = g.NG_APP_API_BASE_URL as string;
      }
      if (fromRuntime) return this.trimTrailingSlash(fromRuntime);
    }
    // Default to relative /api to work with proxy/server
    return '/api';
  }

  private trimTrailingSlash(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
}
