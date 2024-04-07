import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, EventResponse } from '../../services/api.service';
import { HeaderComponent } from '../../components/header/header.component';
import { Power, Role } from '../../entity/player.model';
import { assignRolesToPlayers, initializePlayers } from '../../utils/initialize-players.utils';
import { checkIfGameIsOver, gameStatus, vote } from '../../utils/vote.utils';
import { GameStep } from '../../utils/game-steps.utils';

export interface Player {
  name: string;
  image: string;
  role: Role;
  power: Power;
  isDead: boolean;
  isReal: boolean;
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
  playerPower: Power = Power.Simple;
  GameStatusEnum = gameStatus;
  vote = vote;
  Power = Power;
  designedVictim = undefined;
  instruction: string = "Votez pour tuer un loup :";
  gameStep: GameStep = GameStep.jour;
  shouldChoosePower: boolean = true;
  playerName: string | undefined = undefined;
  isPlayerDead: boolean = false;

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
    initializePlayers(this.players);
    this.shouldChoosePower = true;
    this.playerPower = Power.Simple;
    this.GameStatusEnum = gameStatus;
    this.designedVictim = undefined;
    this.instruction = "Votez pour tuer un loup :";
    this.gameStep = GameStep.jour;
    this.playerName = this.players[0].name;
    this.isPlayerDead = false;
  }
  playerVote(isWolf: boolean, player?: Player) {

    const subscriptionCall = (response: EventResponse) => {

      const myPlayer = this.players.find(p => p.name === response.name);
      this.messages.push(`MJ: ${response.message} ${response.name}`);

      response.reasons?.forEach(reason => {
        if(reason.reason !== "" && reason.playerName !== ""){
          this.messages.push(`${reason.playerName} : ${reason.reason}`);
        }
      })

      if(myPlayer){
        myPlayer.isDead = true;
        const filteredPlayers = this.players.filter(player => !player.isDead)
        this.gameStatus = checkIfGameIsOver(filteredPlayers);
        this.isPlayerDead = this.isPlayerDead || myPlayer.name === this.players[0].name;
        if(this.isPlayerDead){
          this.playerVote(!isWolf);
        }
      }
    }

    if(this.gameStatus === gameStatus.running){
      const filteredPlayers = this.players.filter(player => !player.isDead)
      if(isWolf){
        if(player){
          this.messages.push(`MJ: vous avez voté pour dévorer ${player.name}.`);
        }
        this.apiService.getNight(filteredPlayers, player?.name).subscribe(subscriptionCall);
      }
      if(!isWolf){
        if(player){
          this.messages.push(`MJ: vous avez voté contre ${player.name}.`);
        }
        this.apiService.getDay(filteredPlayers, player?.name).subscribe(subscriptionCall);
      }
    }
  };

  goToNight(){
    if(this.playerPower === Power.Loup){
      this.instruction = "Qui voulez-vous dévorer ?";
      this.gameStep = GameStep.loups;
    }
    else{
      this.playerVote(true);
    }
  }

  selectPlayer(player: Player){
    switch(this.gameStep){
      //à décommenter si on implémente la voyante
      /*case GameStep.jour:
        this.villagerVote(player);
        this.instruction = "Quelle carte voulez-vous voir ?";
        this.gameStep = GameStep.voyante;
        break;
      case GameStep.voyante:
        this.messages.push(`MJ: Vous avez utilisé votre pouvoir de voyante : ${player.name} est ${player.power}`);
        this.wolfVote(player);
        this.instruction = "Votez pour tuer un loup :"
        this.gameStep = GameStep.jour;
        break;*/
        case GameStep.jour:
          this.playerVote(false, player);
          this.goToNight();
          break;
        case GameStep.loups:
          this.playerVote(true, player);
          this.instruction = "Votez pour tuer un loup :";
          this.gameStep = GameStep.jour;
          break;
    }
  }

  choosePower(power: Power){
    this.playerPower = power;
    this.shouldChoosePower = false;
    assignRolesToPlayers(this.players, this.playerPower);
  }
}
