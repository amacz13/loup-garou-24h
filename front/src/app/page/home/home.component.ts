import { NgFor, NgIf } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, EventResponse } from '../../services/api.service';
import { HeaderComponent } from '../../components/header/header.component';
import { Power, Role } from '../../entity/player.model';
import { assignRolesToPlayers, initializePlayers } from '../../utils/initialize-players.utils';
import { checkIfGameIsOver, gameStatus, vote } from '../../utils/vote.utils';
import { GameStep } from '../../utils/game-steps.utils';
import {response} from "express";

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
export class HomeComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
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



  maxHeight = 500; // Example max height in pixels

  // Method to scroll to the bottom of the div
  scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  // Lifecycle hook called after the view has been checked
  ngAfterViewChecked(): void {
    this.scrollToBottom();
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
  playerVote(isWolfSelection: boolean, player?: Player) {

    if(this.gameStatus === gameStatus.running){
      const filteredPlayers = this.players.filter(player => !player.isDead)
      if(isWolfSelection){
        if(player){
          this.messages.push(`MJ: vous avez voté pour dévorer ${player.name}.`);
        }
        return this.apiService.getNight(filteredPlayers, player?.name).then(response => {
          if (response) this.handleApiResponse(response,isWolfSelection);
        });
      } else {
        if(player){
          this.messages.push(`MJ: vous avez voté contre ${player.name}.`);
        }
        return this.apiService.getDay(filteredPlayers, player?.name).then(response => {
          if (response) this.handleApiResponse(response,isWolfSelection);
        });
      }
    }
    return Promise.resolve()
  };

  handleApiResponse(response: EventResponse, isWolfSelection: boolean) {
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
        this.playerVote(!isWolfSelection);
      }
    }
  }

  capitalizeFirstLetter(str?: string): string | undefined {
    if(!str){
      return undefined;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  goToNight(){
    if(this.playerPower === Power.Loup){
      this.instruction = "Qui voulez-vous dévorer ?";
      this.gameStep = GameStep.loups;
    }
    else{
      setTimeout(() => this.playerVote(true), 1000);
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
          this.playerVote(false, player).then(() => this.goToNight())
          //this.goToNight();
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

  getEndMessage(){
    const firstLine = this.gameStatus === this.GameStatusEnum.villagersWon ? "villageois" : "loups-garous";
    const secondLine = this.players[0].power === Power.Loup && this.gameStatus === this.GameStatusEnum.werewolfesWon
    || this.players[0].power !== Power.Loup && this.gameStatus === this.GameStatusEnum.villagersWon ? "Félicitations !" : "Dommage, vous ferez mieux la prochaine fois !";
    const thirdLine = this.isPlayerDead ? "Vous n'avez pas survécu à cette partie." : "";
    return `${thirdLine} Les ${firstLine} ont gagné ! ${secondLine}`;
  }
}
