export enum Role {
  Villager = "Villageois",
  Werewolf = "Loup Garou"
}

export enum Power {
  Voyante = "Voyante",
  Sorciere = "Sorcière",
  Salvateur = "Salvateur",
  Loup = "Loup Garou",
  Simple = "Simple villageois"
}
export interface Player {
  name: string
  role: Role
}
