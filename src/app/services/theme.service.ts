import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  renderer: Renderer2;
  currentTheme: string;

  constructor(
    private storageService: StorageService,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  async applyCurrentTheme() {
    const theme = await this.storageService.getUserTheme();
    if (theme) {
      this.setTheme(theme);
    }
  }

  setTheme(theme: string) {
    if (this.currentTheme) {
      this.renderer.removeClass(this.document.body, `${this.currentTheme}-theme`);
    }
    this.renderer.addClass(this.document.body, `${theme}-theme`);
    this.currentTheme = theme;
  }
}
