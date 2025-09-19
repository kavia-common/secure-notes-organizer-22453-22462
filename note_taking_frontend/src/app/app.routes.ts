import { Routes } from '@angular/router';
import { NotesPage } from './notes/notes.page';

export const routes: Routes = [
  { path: '', component: NotesPage },
  { path: '**', redirectTo: '' }
];
