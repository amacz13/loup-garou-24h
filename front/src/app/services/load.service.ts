import {Injectable, signal} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class LoadService {
  state = signal<'day'|'night'>('day');
}
