import { Role, Power } from "../entity/player.model";
import { Player } from "../page/home/home.component";

  // Function to shuffle arrays
  function shuffleArray(array: any[]): any[] {
    return array.sort(() => Math.random() - 0.5);
  }

  // Function to assign roles
  function assignRole(index: number): [Role, Power] {
    if (index < 2) {
      return [Role.Werewolf, Power.Loup];
    } else if(index === 2) {
      return [Role.Villager, Power.Salvateur];
    }  else if(index === 3) {
      return [Role.Villager, Power.Voyante];
    }  else if(index === 4) {
      return [Role.Villager, Power.Sorciere];
    } else {
      return [Role.Villager, Power.Simple];
    }
  }

export function initializePlayers(players: Array<Player>) {
  // Define player names and images
  const playerNames = ['Aphrodite', 'Apollon', 'Arès', 'Artémis', 'Athéna', 'Hadès', 'Hermès', 'Poséidon'];
  const playerImages = ['aphrodite.png', 'apollo.png', 'ares.png', 'artemis.png', 'athena.png', 'hades.png', 'hermes.png', 'poseidon.png'];

  // Shuffle player names and images to assign random roles
  const shuffledNames = shuffleArray(playerNames);
  const shuffledImages = shuffleArray(playerImages);

  // Assign roles to players
  for (let i = 0; i < playerNames.length; i++) {
    const [role, power] = assignRole(i);
    players.push({
      name: shuffledNames[i],
      image: 'assets/characters/' + shuffledImages[i],
      role: role,
      power: power,
      isDead: false });
  }
}
