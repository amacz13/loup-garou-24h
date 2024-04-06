import { Role } from "../entity/player.model";
import { Player } from "../page/home/home.component";

export enum gameStatus {
  werewolfesWon,
  villagersWon,
  running
}

export function checkIfGameIsOver(players: Array<Player>): gameStatus {
  const remainingVillagers = players.find(p =>
    p.isDead === false && p.role === Role.Villager
  );

  if(!remainingVillagers){
    return gameStatus.werewolfesWon
  }

  const remainingWerewolfes = players.find(p =>
    p.isDead === false && p.role === Role.Werewolf
  );
  if(!remainingWerewolfes){
    return gameStatus.villagersWon
  }
  return gameStatus.running;
}

export function vote(player: Player, players: Array<Player>): gameStatus {
  const myPlayer = players.find(p => p.name === player.name);
  if(myPlayer){
    myPlayer.isDead = true;
    return checkIfGameIsOver(players);
  }
  return gameStatus.running;
}
