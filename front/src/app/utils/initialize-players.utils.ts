import { log } from "console";
import { Role, Power } from "../entity/player.model";
import { Player } from "../page/home/home.component";

  // Function to shuffle arrays
  function shuffleArray(array: any[]): any[] {
    return array.sort(() => Math.random() - 0.5);
  }

  // Function to assign roles
  function assignRole(index: number, chosenPower: Power): [Role, Power] {
    if (index === 0) {
      console.log(chosenPower);

      return [chosenPower === Power.Loup ? Role.Werewolf : Role.Villager, chosenPower];
    } else if(index === 1) {
      return chosenPower === Power.Loup ?  [Role.Villager, Power.Simple] : [Role.Werewolf, Power.Loup]
    } else if(index === 2) {
      return [Role.Werewolf, Power.Loup];
    }  else if(index === 3) {
      return [Role.Villager, Power.Voyante];
    }  else if(index === 4) {
      return [Role.Villager, Power.Sorciere];
    } else if(index === 5) {
      return [Role.Villager, Power.Salvateur];
    } else {
      return [Role.Villager, Power.Simple];
    }
  }

export function initializePlayers(players: Array<Player>) {

  const playersNamesAndImages: Array<{name: string, image: string}> = [
    { name: 'Aphrodite', image: 'aphrodite.png' },
    { name: 'Apollon', image: 'apollo.png' },
    { name: 'Arès', image: 'ares.png' },
    { name: 'Artémis', image: 'artemis.png' },
    { name: 'Athéna', image: 'athena.png' },
    { name: 'Hadès', image: 'hades.png' },
    { name: 'Hermès', image: 'hermes.png' },
    { name: 'Poséidon', image: 'poseidon.png' }
  ];

  const shuffled: Array<{name: string, image: string}> = shuffleArray(playersNamesAndImages);

  for (let i = 0; i < shuffled.length; i++) {
    players.push({
      name: shuffled[i].name,
      image: 'assets/characters/' + shuffled[i].image,
      role: Role.Villager,
      power: Power.Simple,
      isDead: false,
      isReal: i === 0, // The first player is the real player
     });
  }
  console.log(players);
}


export function assignRolesToPlayers(players: Array<Player>, chosenPower: Power) {
  for (let i = 0; i < players.length; i++) {
    const [role, power] = assignRole(i, chosenPower);
     players[i].role = role;
     players[i].power = power;
  }
  console.log(players);
}
