import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Note } from '../models/note.model';
import { EnvironmentService } from './environment.service';

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class NotesService {
  /** This is a public service for managing notes via REST API. */
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);
  private get base() { return `${this.env.apiBaseUrl}/notes`; }

  // PUBLIC_INTERFACE
  list(params?: { q?: string; categoryId?: string; pinned?: boolean }): Observable<Note[]> {
    /** List notes with optional search and category filter. */
    let hp = new HttpParams();
    if (params?.q) hp = hp.set('q', params.q);
    if (params?.categoryId) hp = hp.set('categoryId', params.categoryId);
    if (typeof params?.pinned === 'boolean') hp = hp.set('pinned', String(params.pinned));
    return this.http.get<Note[]>(this.base, { params: hp }).pipe(
      catchError(() => of([])) // fallback to empty list
    );
  }

  // PUBLIC_INTERFACE
  get(id: string): Observable<Note> {
    /** Get a single note by id. */
    return this.http.get<Note>(`${this.base}/${encodeURIComponent(id)}`);
  }

  // PUBLIC_INTERFACE
  create(payload: Partial<Note>): Observable<Note> {
    /** Create a new note. */
    return this.http.post<Note>(this.base, payload);
  }

  // PUBLIC_INTERFACE
  update(id: string, payload: Partial<Note>): Observable<Note> {
    /** Update an existing note. */
    return this.http.put<Note>(`${this.base}/${encodeURIComponent(id)}`, payload);
  }

  // PUBLIC_INTERFACE
  remove(id: string): Observable<void> {
    /** Delete a note by id. */
    return this.http.delete<void>(`${this.base}/${encodeURIComponent(id)}`);
  }

  // PUBLIC_INTERFACE
  togglePin(id: string, pinned: boolean): Observable<Note> {
    /** Pin/unpin a note. */
    return this.http.patch<Note>(`${this.base}/${encodeURIComponent(id)}`, { pinned });
  }
}
