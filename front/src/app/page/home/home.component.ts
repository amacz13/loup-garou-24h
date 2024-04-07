import { NgFor, NgIf } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, EventResponse } from '../../services/api.service';
import { HeaderComponent } from '../../components/header/header.component';
import { Power, Role } from '../../entity/player.model';
import { assignRolesToPlayers, initializePlayers } from '../../utils/initialize-players.utils';
import { checkIfGameIsOver, gameStatus, vote } from '../../utils/vote.utils';
import { GameStep } from '../../utils/game-steps.utils';
import {LoadService} from "../../services/load.service";

export interface Player {
  name: string;
  image: string;
  role: Role;
  power: Power;
  isDead: boolean;
  isReal: boolean;
  roleDetail: {
    knownPlayerList?: Array<Player>
  }
}

interface Message {
  author: string;
  content: string;
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
  messages: Message[] = [];
  newMessage: string = '';
  players: Player[] = [];
  gameStatus: gameStatus = gameStatus.running;
  playerPower: Power = Power.Simple;
  GameStatusEnum = gameStatus;
  GameStep = GameStep;
  vote = vote;
  Power = Power;
  designedVictim = undefined;
  instruction: string = "Votez pour tuer un loup :";
  gameStep: GameStep = GameStep.jour;
  shouldChoosePower: boolean = true;
  playerName: string | undefined = undefined;
  isPlayerDead: boolean = false;

  constructor(private apiService: ApiService, private loadService: LoadService) {

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
      this.messages.push({author: "You", content: this.newMessage});
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
    this.messages.push({author: "MJ", content: "Bienvenue mesdames et messieurs dans ce petit village de Thiercelieux ! Tout d'abord, vous allez devoir voter pour éliminer une personne que vous soupçonnez d'être loup-garou. A vos débats !"});
  }
  playerVote(isWolfSelection: boolean, player?: Player) {

    if(this.gameStatus === gameStatus.running){
      const filteredPlayers = this.players.filter(player => !player.isDead)
      if(isWolfSelection){
        if(player){
          this.messages.push({author: "MJ", content: `Vous avez voté pour dévorer ${this.capitalizeFirstLetter(player.name)}.`});
        }
        this.loadService.state.set("night");
        return this.apiService.getNight(filteredPlayers, player?.name).then(response => {
          if (response) this.handleApiResponse(response,isWolfSelection);
        });
      } else {
        if(player){
          this.messages.push({author: "MJ", content: `Vous avez voté contre ${this.capitalizeFirstLetter(player.name)}.`});
        }
        this.loadService.state.set("day");
        return this.apiService.getDay(filteredPlayers, player?.name).then(response => {
          if (response) this.handleApiResponse(response,isWolfSelection);
        });
      }
    }
    return Promise.resolve()
  };

  handleApiResponse(response: EventResponse, isWolfSelection: boolean) {
    const myPlayer = this.players.find(p => p.name === response.name);
    this.messages.push({author: "MJ", content: `${response.message} ${response.name}`});

    response.reasons?.forEach(reason => {
      if(reason.reason !== "" && reason.playerName !== ""){
        this.messages.push({author: reason.playerName, content: reason.reason});
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

  selectRandomPlayer() {
    // Filter players that are not dead and not already in the knownPlayerList
    const availablePlayers = this.players.filter(player =>
      !player.isDead && !this.players.find(p => p.power === Power.Voyante)?.roleDetail.knownPlayerList?.some(knownPlayer => knownPlayer.name === player.name)
    );

    if (availablePlayers.length > 0) {
      // Select a random player from the filtered list
      const randomIndex = Math.floor(Math.random() * availablePlayers.length);
      const randomPlayer = availablePlayers[randomIndex];

      this.players.find(p => p.power === Power.Voyante)?.roleDetail.knownPlayerList?.push(randomPlayer);

    }
  }

  goToVoyante(){
    if(this.playerPower === Power.Voyante){
      this.instruction = "Quelle carte voulez-vous voir ?";
      this.gameStep = GameStep.voyante;
    }
    else{
      this.goToNight();
    }
  }

  goToNight(){
    if(this.playerPower === Power.Loup){
      this.instruction = "Qui voulez-vous dévorer ?";
      this.gameStep = GameStep.loups;
    }
    else{
      this.instruction = "Votez pour tuer un loup :";
      this.gameStep = GameStep.jour;
      setTimeout(() => this.playerVote(true), 1000);
    }
  }

  selectPlayer(player: Player){
    switch(this.gameStep){
        case GameStep.voyante:
          this.messages.push({author: "MJ", content: `Vous avez utilisé votre pouvoir de voyante : ${this.capitalizeFirstLetter(player.name)} est ${player.power}`});
          this.goToNight();
          break;
        case GameStep.jour:
          this.playerVote(false, player).then(() => this.goToVoyante());
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
