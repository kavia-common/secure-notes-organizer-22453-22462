import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../../core/models/note.model';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.css']
})
export class NoteEditorComponent {
  @Input() note: Partial<Note> = {};
  @Output() save = new EventEmitter<Partial<Note>>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit() {
    const title = (this.note.title || '').trim();
    const content = (this.note.content || '').trim();
    this.save.emit({ ...this.note, title, content });
  }
}
