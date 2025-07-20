import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { AvailableColor } from '../constants';

@Injectable({ providedIn: 'root' })
export class ColorsService {
  private colorsSubject = new BehaviorSubject<AvailableColor[]>([]);
  colors$ = this.colorsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadColors();
  }

  loadColors() {
    this.http.get<AvailableColor[]>('/assets/colors.json').subscribe(colors => {
      this.colorsSubject.next(colors);
    });
  }
}