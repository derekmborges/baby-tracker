import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Feeding } from '../models/feeding';
import { Sleep } from '../models/sleep';
import { Guid } from '../helpers/guid';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) { }

  async saveSettings(name: string, theme: string) {
    await this.storage.set('babyName', name);
    await this.storage.set('userTheme', theme);
    if (await this.storage.get('introCompleted') == null) {
      await this.storage.set('introCompleted', true);
    }
  }

  async isNewUser(): Promise<boolean> {
    return !(await this.storage.get('introCompleted'));
  }

  async getBabyName(): Promise<string> {
    return await this.storage.get('babyName');
  }

  async getUserTheme(): Promise<string> {
    return await this.storage.get('userTheme');
  }

  async getAllFeedings(): Promise<Feeding[]> {
    const allFeedings: Feeding[] = JSON.parse(await this.storage.get('feedings'));
    return Promise.resolve(allFeedings);
  }

  async getPreviousFeeding(): Promise<Feeding> {
    const allFeedings = await this.getAllFeedings();
    console.log('all feedings:', allFeedings);

    // if some data exists
    if (allFeedings && allFeedings.length > 0) {
      // get the latest item
      const previousFeeding: Feeding = allFeedings[allFeedings.length - 1];
      return Promise.resolve(previousFeeding);
    }
  }

  async saveFeeding(feeding: Feeding): Promise<Feeding[]> {
    feeding.id = Guid.newGuid();
    let allFeedings = await this.getAllFeedings();
    if (allFeedings) {
      allFeedings.push(feeding);
    } else {
      allFeedings = [feeding];
    }
    const result = await this.storage.set('feedings', JSON.stringify(allFeedings));
    console.log('feeding save result:', result);

    return Promise.resolve(result);
  }

  async deleteFeeding(feeding: Feeding) {
    let allFeedings = await this.getAllFeedings();
    allFeedings = allFeedings.filter(f => f.id !== feeding.id);
    await this.storage.set('feedings', JSON.stringify(allFeedings));
  }

  async updateFeeding(updatedFeeding: Feeding) {
    const allFeedings = await this.getAllFeedings();
    allFeedings.forEach(feeding => {
      if (feeding.id === updatedFeeding.id) {
        feeding.type = updatedFeeding.type;
        feeding.bottleDetails = updatedFeeding.bottleDetails;
        feeding.breastDetails = updatedFeeding.breastDetails;
        feeding.time = updatedFeeding.time;
      }
    });
    await this.storage.set('feedings', JSON.stringify(allFeedings));
  }




  async getAllSleep(): Promise<Sleep[]> {
    const allSleep: Sleep[] = JSON.parse(await this.storage.get('sleep'));
    return Promise.resolve(allSleep);
  }

  async getCurrentSleep(): Promise<Sleep> {
    return Promise.resolve(
      JSON.parse(await this.storage.get('currentSleep'))
    );
  }

  async getPreviousSleep(): Promise<Sleep> {
    const allSleep = await this.getAllSleep();

    if (allSleep && allSleep.length > 0) {
      const previousSleep: Sleep = allSleep[allSleep.length - 1];
      return Promise.resolve(previousSleep);
    }
  }

  async saveCurrentSleep(currentSleep: Sleep) {
    const result = await this.storage.set('currentSleep', JSON.stringify(currentSleep));
    console.log('saved current sleep:', result);
  }

  async saveCompleteSleep(sleep: Sleep) {
    sleep.id = Guid.newGuid();

    let allSleep = await this.getAllSleep();
    if (allSleep) {
      allSleep.push(sleep);
    } else {
      allSleep = [sleep];
    }

    await this.storage.set('sleep', JSON.stringify(allSleep));
    await this.storage.remove('currentSleep');
  }

  async deleteCurrentSleep() {
    await this.storage.remove('currentSleep');
  }

  async deleteSleep(sleep: Sleep) {
    let allSleep = await this.getAllSleep();
    allSleep = allSleep.filter(s => s.id !== sleep.id);
    await this.storage.set('sleep', JSON.stringify(allSleep));
  }

  async updateSleep(updatedSleep: Sleep) {
    const allSleep = await this.getAllSleep();
    allSleep.forEach(sleep => {
      if (sleep.id === updatedSleep.id) {
        sleep.startTime = updatedSleep.startTime;
        sleep.endTime = updatedSleep.endTime;
      }
    });
    await this.storage.set('sleep', JSON.stringify(allSleep));
  }
}
