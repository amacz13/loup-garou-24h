import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Player {
  name: string;
  image: string;
}

@Component({
  standalone:true,
  selector: 'home-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports:[FormsModule, NgFor]
})
export class HomeComponent {
  messages: string[] = [];
  newMessage: string = '';

  sendMessage() {
    if (this.newMessage.trim() !== '') {
      this.messages.push(`You: ${this.newMessage}`);
      this.newMessage = '';
    }
  }

  vote() {
    // Logic to vote against a player
    console.log("Voting against a player...");
  }

  players: Player[] = [
    { name: 'Aphrodite', image: 'assets/characters/aphrodite.png' },
    { name: 'Apollon', image: 'assets/characters/apollo.png' },
    { name: 'Arès', image: 'assets/characters/ares.png' },
    { name: 'Artémis', image: 'assets/characters/artemis.png' },
    { name: 'Athéna', image: 'assets/characters/athena.png' },
    { name: 'Hadès', image: 'assets/characters/hades.png' },
    { name: 'Hermès', image: 'assets/characters/hermes.png' },
    { name: 'Poséidon', image: 'assets/characters/poseidon.png' },
    { name: 'Prométhée', image: 'assets/characters/prometheus.png' },
  ];
}

