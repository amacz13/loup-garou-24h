export enum Role {
  Villager = "Villageois",
  Werewolf = "Loup-garou"
}

export enum Power {
  Voyante = "Voyante",
  Sorciere = "Sorcière",
  Salvateur = "Salvateur",
  Loup = "Loup-garou",
  Simple = "Simple villageois"
}
export interface Player {
  name: string
  role: Role
}
