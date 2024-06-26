import { Component, Input } from '@angular/core';
import { GameStep } from '../../utils/game-steps.utils';
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() gameStep: GameStep = GameStep.jour;
  GameStep = GameStep

  playEasterEgg() {
    const song = document.createElement("audio");
    song.src = "https://cdns-preview-e.dzcdn.net/stream/c-e93217f91d493f166fbb49ee0e74daa1-4.mp3";
    song.play();
    document.getElementsByClassName("garou")[0].classList.add("spin");
    song.onended = () => {
      document.getElementsByClassName("garou")[0].classList.remove("spin");
      song.remove();
    }
  }
}
