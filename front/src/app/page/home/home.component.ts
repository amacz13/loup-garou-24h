import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HeaderComponent } from '../../components/header/header.component';
import { Power, Role } from '../../entity/player.model';
import { initializePlayers } from '../../utils/initialize-players.utils';
import { checkIfGameIsOver, gameStatus, vote } from '../../utils/vote.utils';

export interface Player {
  name: string;
  image: string;
  role: Role;
  power: Power;
  isDead: boolean;
}

@Component({
  standalone: true,
  selector: 'home-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports:[FormsModule, NgFor, NgIf, HeaderComponent]
})
export class HomeComponent implements OnInit {
  messages: string[] = [];
  newMessage: string = '';
  players: Player[] = [];
  gameStatus: gameStatus = gameStatus.running;
  isDay: boolean = false;
  playerRole: Role = Role.Villager;
  GameStatusEnum = gameStatus;
  vote = vote;

  constructor(private apiService: ApiService) {

  }

  ngOnInit(): void {
    this.initializeGame();
  }

  sendMessage() {
    if (this.newMessage.trim() !== '') {
      this.messages.push(`You: ${this.newMessage}`);
      this.newMessage = '';
    }
  }

  initializeGame() {
    this.messages= [];
    this.newMessage= '';
    this.players = [];
    this.gameStatus = gameStatus.running;
    this.isDay = false;
    initializePlayers(this.players);
    this.startGame();
  }

  playGame() {

    const filteredPlayers = this.players.filter(player => !player.isDead)

    const subscribtionCall = (nightResponse: any) => {
      const myPlayer = this.players.find(p => p.name === nightResponse.name);
      this.messages.push(`MJ: ${nightResponse.message}`);
      if(myPlayer){
        myPlayer.isDead = true;

        this.gameStatus = checkIfGameIsOver(this.players);
      }

      if(this.gameStatus === gameStatus.running){
        this.isDay = !this.isDay;
        this.playGame();
      }
    }

    this.isDay ?
      this.apiService.getDay(filteredPlayers).subscribe(subscribtionCall)
     : this.apiService.getNight(filteredPlayers).subscribe(subscribtionCall);

  };

  startGame(): void {
    this.playGame();
  }

}
