import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class IntroGuard implements CanActivate {

  constructor(
    private storageService: StorageService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    const babyInfo = await this.storageService.getBabyInfo();
    console.log('babyInfo:', babyInfo);
    if (!babyInfo) {
      this.router.navigateByUrl('intro');
    }
    return babyInfo !== undefined;
  }

}
