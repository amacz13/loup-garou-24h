import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AppComponent } from '../../app.component';
import { HeaderComponent } from '../../components/header/header.component';

interface Player {
  name: string;
  image: string;
  role: string;
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
  gameStatus: "running" | "villagersWon" | "werewolfesWon" = "running";
  isDay: boolean = false;

  constructor(private apiService: ApiService) {

  }

  ngOnInit(): void {
    this.initializeGame();
  }

  initializePlayers() {
    // Define player names and images
    const playerNames = ['Aphrodite', 'Apollon', 'Arès', 'Artémis', 'Athéna', 'Hadès', 'Hermès', 'Poséidon'];
    const playerImages = ['aphrodite.png', 'apollo.png', 'ares.png', 'artemis.png', 'athena.png', 'hades.png', 'hermes.png', 'poseidon.png'];

    // Shuffle player names and images to assign random roles
    const shuffledNames = this.shuffleArray(playerNames);
    const shuffledImages = this.shuffleArray(playerImages);

    // Assign roles to players
    for (let i = 0; i < playerNames.length; i++) {
      const role = this.assignRole(i);
      this.players.push({ name: shuffledNames[i], image: 'assets/characters/' + shuffledImages[i], role: role, isDead: false });
    }
  }

  initializeGame() {
    this.messages= [];
    this.newMessage= '';
    this.players = [];
    this.gameStatus = "running";
    this.isDay = false;
    this.initializePlayers();
    this.startGame();
  }

  checkIfGameIsOver(){
    const remainingVillagers = this.players.find(p =>
      p.isDead === false && p.role === 'Villager'
    );

    if(!remainingVillagers){
      this.gameStatus = "werewolfesWon"
    }

    const remainingWerewolfes = this.players.find(p =>
      p.isDead === false && p.role === 'Werewolf'
    );
    if(!remainingWerewolfes){
      this.gameStatus = "villagersWon"
    }
  }

  // Function to shuffle arrays
  shuffleArray(array: any[]): any[] {
    return array.sort(() => Math.random() - 0.5);
  }

  // Function to assign roles
  assignRole(index: number): string {
    // Logic to assign roles based on index or any other criteria
    // For example, assign Werewolf role to first 2 players, Seer role to the third player, etc.
    if (index < 2) {
      return 'Werewolf';
    } else {
      return 'Villager';
    }
  }

  sendMessage() {
    if (this.newMessage.trim() !== '') {
      this.messages.push(`You: ${this.newMessage}`);
      this.newMessage = '';
    }
  }

  vote(player: Player) {
    const myPlayer = this.players.find(p => p.name === player.name);
    if(myPlayer){
      myPlayer.isDead = true;
      this.checkIfGameIsOver();
    }
  }

  startGame(): void {
    const playGame = () => {

      const filteredPlayers = this.players.filter(player => !player.isDead)

      const subscribtionCall = (nightResponse: any) => {
        const myPlayer = this.players.find(p => p.name === nightResponse.name);
        this.messages.push(`MJ: ${nightResponse.message}`);
        if(myPlayer){
          myPlayer.isDead = true;
          this.checkIfGameIsOver();
        }

        if(this.gameStatus === "running"){
          this.isDay = !this.isDay;
          playGame();
        }
      }

      this.isDay ?
        this.apiService.getDay(filteredPlayers).subscribe(subscribtionCall)
       : this.apiService.getNight(filteredPlayers).subscribe(subscribtionCall);

    };

    playGame();
  }

}
