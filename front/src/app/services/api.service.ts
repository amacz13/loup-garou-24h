import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Player } from "../entity/player.model";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url: string = '/api/';
  private night: string = 'jour';
  private day: string = 'nuit';
  constructor(private httpClient: HttpClient) {}

  getNight(players: Player[]) {
    return this.httpClient.post(this.url + this.night, {players: players});
  }

  getDay(players: Player[]) {
    return this.httpClient.post(this.url + this.day, players);
  }

}
