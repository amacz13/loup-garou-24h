import { Role, Power } from "../entity/player.model";
import { Player } from "../page/home/home.component";

  // Function to shuffle arrays
  function shuffleArray(array: any[]): any[] {
    return array.sort(() => Math.random() - 0.5);
  }

  // Function to assign roles
  function assignRole(index: number, chosenPower: Power): [Role, Power] {
    if (index === 0) {
      return [chosenPower === Power.Loup ? Role.Werewolf : Role.Villager, chosenPower];
    } else if(index === 1) {
      return chosenPower === Power.Loup ?  [Role.Villager, Power.Simple] : [Role.Werewolf, Power.Loup]
    } else if(index === 2) {
      return [Role.Werewolf, Power.Loup];
    }  else if(index === 3) {
      return chosenPower === Power.Voyante ?  [Role.Villager, Power.Simple] : [Role.Villager, Power.Voyante]
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
    { name: 'marguerite', image: 'aphrodite.png' },
    { name: 'gerard', image: 'apollo.png' },
    { name: 'michel', image: 'ares.png' },
    { name: 'jocelyne', image: 'artemis.png' },
    { name: 'myrtille', image: 'athena.png' },
    { name: 'julien', image: 'hades.png' },
    { name: 'florent', image: 'hermes.png' },
    { name: 'pascal', image: 'poseidon.png' }
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
}


export function assignRolesToPlayers(players: Array<Player>, chosenPower: Power) {
  for (let i = 0; i < players.length; i++) {
    const [role, power] = assignRole(i, chosenPower);
     players[i].role = role;
     players[i].power = power;
  }
}
