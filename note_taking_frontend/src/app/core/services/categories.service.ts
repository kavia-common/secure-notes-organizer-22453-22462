import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Category } from '../models/category.model';
import { EnvironmentService } from './environment.service';

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class CategoriesService {
  /** This is a public service for managing categories via REST API. */
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);
  private get base() { return `${this.env.apiBaseUrl}/categories`; }

  // PUBLIC_INTERFACE
  list(): Observable<Category[]> {
    /** List all categories. */
    return this.http.get<Category[]>(this.base).pipe(catchError(() => of([])));
  }

  // PUBLIC_INTERFACE
  create(name: string, color?: string): Observable<Category> {
    /** Create a category. */
    return this.http.post<Category>(this.base, { name, color });
  }

  // PUBLIC_INTERFACE
  remove(id: string): Observable<void> {
    /** Delete a category. */
    return this.http.delete<void>(`${this.base}/${encodeURIComponent(id)}`);
  }
}
