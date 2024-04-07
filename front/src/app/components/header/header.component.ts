import { Component, Input } from '@angular/core';
import { GameStep } from '../../utils/game-steps.utils';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() gameStep: GameStep = GameStep.jour;
  GameStep = GameStep

}
