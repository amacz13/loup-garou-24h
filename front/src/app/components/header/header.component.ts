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

}
