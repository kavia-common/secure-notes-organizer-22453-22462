import { Injectable, Inject, Optional, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  /** This is a public service that exposes runtime environment details. */
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    // Use a structural type to avoid relying on DOM Document global in Node lint context
    @Optional() @Inject(DOCUMENT) private doc?: { querySelector?: (selectors: string) => any },
  ) {}

  // PUBLIC_INTERFACE
  get apiBaseUrl(): string {
    /** Resolve API base URL from meta tag or global, SSR safe. */
    const isBrowser = isPlatformBrowser(this.platformId);
    if (isBrowser) {
      // Prefer meta tag if present
      const meta = this.doc?.querySelector?.('meta[name="NG_APP_API_BASE_URL"]') as any;
      const fromMeta = meta?.content && typeof meta.content === 'string' ? meta.content.trim?.() : '';
      if (fromMeta) return this.trimTrailingSlash(fromMeta);

      // Fallback to global runtime var if present
      const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : undefined;
      const fromRuntime = (g && typeof g.NG_APP_API_BASE_URL === 'string') ? (g.NG_APP_API_BASE_URL as string) : undefined;
      if (fromRuntime) return this.trimTrailingSlash(fromRuntime);
    }
    // Default to relative /api to work with proxy/server
    return '/api';
  }

  private trimTrailingSlash(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
}
