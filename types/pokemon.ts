export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  species: {
    name: string;
    url: string;
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

export interface PokemonSpecies {
  id: number;
  name: string;
  capture_rate: number;
  habitat: {
    name: string;
    url: string;
  } | null;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  evolution_chain: {
    url: string;
  };
}

export interface EvolutionChain {
  id: number;
  chain: EvolutionDetail;
}

export interface EvolutionDetail {
  species: {
    name: string;
    url: string;
    chineseName?: string;
  };
  evolution_details: EvolutionRequirement[];
  evolves_to: EvolutionDetail[];
}

export interface EvolutionRequirement {
  min_level: number | null;
  min_happiness: number | null;
  min_affection: number | null;
  min_beauty: number | null;
  item: {
    name: string;
    url: string;
    chineseName?: string;
  } | null;
  trigger: {
    name: string;
    url: string;
    chineseName?: string;
  };
  time_of_day: string;
  location: {
    name: string;
    url: string;
  } | null;
  known_move: {
    name: string;
    url: string;
  } | null;
  known_move_type: {
    name: string;
    url: string;
  } | null;
  party_species: {
    name: string;
    url: string;
  } | null;
  party_type: {
    name: string;
    url: string;
  } | null;
  relative_physical_stats: number | null;
  needs_overworld_rain: boolean;
  turn_upside_down: boolean;
}