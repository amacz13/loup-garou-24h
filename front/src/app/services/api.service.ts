import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Player } from "../entity/player.model";
import { Observable } from 'rxjs';

interface EventResponse {
  name: string;
  message: string;
}
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url: string = '/api/';
  private night: string = 'nuit';
  private day: string = 'jour';
  constructor(private httpClient: HttpClient) {}

  getNight(players: Player[]): Observable<EventResponse> {
    return this.httpClient.post<EventResponse>(this.url + this.night, {players: players});
  }

  getDay(players: Player[]): Observable<EventResponse> {
    return this.httpClient.post<EventResponse>(this.url + this.day, {players: players});
  }

}
