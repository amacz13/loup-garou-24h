import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { Player } from '../page/home/home.component';

interface PlayerReason {
  playerName: string;
  reason: string;
}

export interface EventResponse {
  name: string;
  message: string;
  reasons: Array<PlayerReason>
}
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url: string = '/api/';
  private night: string = 'nuit';
  private day: string = 'jour';
  private cupidon: string = 'cupidon';
  private chasseur: string = 'chasseur';
  constructor(private httpClient: HttpClient) {}

  getNight(players: Player[], target?: string): Promise<EventResponse | undefined> {
    return this.httpClient.post<EventResponse>(this.url + this.night, {players: players, target: target}).toPromise();
  }

  getDay(players: Player[], target?: string): Promise<EventResponse | undefined> {
    return this.httpClient.post<EventResponse>(this.url + this.day, {players: players, target: target}).toPromise();
  }

  getCupid(players: Player[]): Promise<any> {
    return this.httpClient.post<any>(this.url + this.cupidon, {players: players}).toPromise();
  }

  getHunter(players: Player[]): Promise<any> {
    return this.httpClient.post<any>(this.url + this.chasseur, {players: players}).toPromise();
  }
}
