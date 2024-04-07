import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Player } from "../entity/player.model";
import { Observable } from 'rxjs';

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
  constructor(private httpClient: HttpClient) {}

  getNight(players: Player[], target?: string): Promise<EventResponse | undefined> {
    return this.httpClient.post<EventResponse>(this.url + this.night, {players: players, target: target}).toPromise();
  }

  getDay(players: Player[], target?: string): Promise<EventResponse | undefined> {
    return this.httpClient.post<EventResponse>(this.url + this.day, {players: players, target: target}).toPromise();
  }
}
