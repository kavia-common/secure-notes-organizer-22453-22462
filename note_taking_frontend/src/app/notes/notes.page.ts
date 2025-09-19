import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from '../layout/topbar/topbar.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { NoteCardComponent } from './note-card/note-card.component';
import { NoteEditorComponent } from './note-editor/note-editor.component';
import { NotesService } from '../core/services/notes.service';
import { Note } from '../core/models/note.model';

@Component({
  selector: 'app-notes-page',
  standalone: true,
  imports: [CommonModule, TopbarComponent, SidebarComponent, NoteCardComponent, NoteEditorComponent],
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.css']
})
export class NotesPage {
  private readonly notesService = inject(NotesService);

  categoryId = signal<string | null>(null);
  searchQuery = signal<string>('');
  notes = signal<Note[]>([]);
  editing = signal<Partial<Note> | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.notesService.list({ q: this.searchQuery(), categoryId: this.categoryId() || undefined }).subscribe(n => this.notes.set(n));
  }

  onSearch(q: string) {
    this.searchQuery.set(q);
    this.load();
  }

  onSelectCategory(catId: string | null) {
    this.categoryId.set(catId);
    this.load();
  }

  openEditor(note?: Note) {
    this.editing.set(note ? { ...note } : { title: '', content: '', categoryId: this.categoryId() || undefined });
  }

  saveEditor(payload: Partial<Note>) {
    const isUpdate = !!payload.id;
    const req = isUpdate ? this.notesService.update(payload.id as string, payload) : this.notesService.create(payload);
    req.subscribe(() => {
      this.editing.set(null);
      this.load();
    });
  }

  remove(note: Note) {
    let proceed = true;
    const g: any = (typeof globalThis !== 'undefined') ? (globalThis as any) : undefined;
    if (g && typeof g.confirm === 'function') {
      proceed = g.confirm('Delete this note?');
    }
    if (!proceed) return;
    this.notesService.remove(note.id).subscribe(() => this.load());
  }

  togglePin(note: Note) {
    this.notesService.togglePin(note.id, !note.pinned).subscribe(() => this.load());
  }

  readonly filtered = computed(() => this.notes());
}
