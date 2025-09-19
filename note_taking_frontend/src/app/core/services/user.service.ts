import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserProfile } from '../models/user.model';
import { EnvironmentService } from './environment.service';

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class UserService {
  /** This is a public service to manage user profile and auth actions. */
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);
  private get base() { return `${this.env.apiBaseUrl}/user`; }

  private cached?: UserProfile;

  // PUBLIC_INTERFACE
  me(force = false): Observable<UserProfile> {
    /** Fetch current user profile (cached). */
    if (this.cached && !force) return of(this.cached);
    return this.http.get<UserProfile>(`${this.base}/me`).pipe(
      tap(p => this.cached = p),
      catchError(() => of({ id: 'guest', name: 'Guest', email: 'guest@example.com' }))
    );
  }

  // PUBLIC_INTERFACE
  logout(): Observable<void> {
    /** Logout current user (no-op fallback). */
    return this.http.post<void>(`${this.base}/logout`, {}).pipe(
      catchError(() => of(void 0))
    );
  }
}
