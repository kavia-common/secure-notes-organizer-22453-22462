import { Component, EventEmitter, Output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { UserProfile } from '../../core/models/user.model';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent {
  @Output() search = new EventEmitter<string>();
  @Output() addNote = new EventEmitter<void>();
  user = signal<UserProfile | null>(null);
  query = '';

  private readonly userService = inject(UserService);

  constructor() {
    this.userService.me().subscribe(u => this.user.set(u));
    effect(() => { void this.user(); });
  }

  onSearchChange() {
    this.search.emit(this.query);
  }

  onLogout() {
    this.userService.logout().subscribe(() => {
      // In real app, redirect to login page or show toast. Using console to avoid no-undef in SSR.
      console.info('Logged out');
    });
  }

  // PUBLIC_INTERFACE
  avatarInitial(u: UserProfile | null): string {
    /** Returns the first character of the user name or 'U'. */
    const name = (u?.name || '').trim();
    return name ? name.slice(0, 1).toUpperCase() : 'U';
  }
}
