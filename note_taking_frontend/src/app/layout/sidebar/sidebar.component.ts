import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesService } from '../../core/services/categories.service';
import { Category } from '../../core/models/category.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() selectedCategoryId: string | null = null;
  @Output() selectCategory = new EventEmitter<string | null>();

  categories: Category[] = [];
  newCategoryName = '';

  private readonly categoriesService = inject(CategoriesService);

  ngOnInit() {
    this.load();
  }

  load() {
    this.categoriesService.list().subscribe(cats => this.categories = cats);
  }

  onSelect(catId: string | null) {
    this.selectCategory.emit(catId);
  }

  add() {
    const name = this.newCategoryName?.trim();
    if (!name) return;
    this.categoriesService.create(name).subscribe(() => {
      this.newCategoryName = '';
      this.load();
    });
  }
}
