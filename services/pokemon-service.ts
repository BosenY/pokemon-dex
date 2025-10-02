import { Pokemon, PokemonListResponse, PokemonSpecies, EvolutionChain } from '@/types/pokemon';

const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2';

// 宝可梦属性名称中文映射
const statNameMap: Record<string, string> = {
  'hp': 'HP',
  'attack': '攻击',
  'defense': '防御',
  'special-attack': '特攻',
  'special-defense': '特防',
  'speed': '速度'
};

// 宝可梦类型名称中文映射
const typeNameMap: Record<string, string> = {
  'normal': '一般',
  'fire': '火',
  'water': '水',
  'electric': '电',
  'grass': '草',
  'ice': '冰',
  'fighting': '格斗',
  'poison': '毒',
  'ground': '地面',
  'flying': '飞行',
  'psychic': '超能力',
  'bug': '虫',
  'rock': '岩石',
  'ghost': '幽灵',
  'dark': '恶',
  'dragon': '龙',
  'steel': '钢',
  'fairy': '妖精'
};

/**
 * 获取宝可梦列表
 * @param limit 每页数量
 * @param offset 偏移量
 * @returns Promise<PokemonListResponse>
 */
export async function fetchPokemonList(
  limit: number = 20,
  offset: number = 0
): Promise<PokemonListResponse> {
  try {
    const response = await fetch(
      `${POKE_API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching pokemon list:', error);
    throw error;
  }
}

/**
 * 根据ID获取宝可梦详情（中文）
 * @param id 宝可梦ID
 * @returns Promise<Pokemon>
 */
export async function fetchPokemonById(id: number): Promise<Pokemon> {
  try {
    const response = await fetch(`${POKE_API_BASE_URL}/pokemon/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching pokemon with id ${id}:`, error);
    throw error;
  }
}

/**
 * 根据名称获取宝可梦详情
 * @param name 宝可梦名称
 * @returns Promise<Pokemon>
 */
export async function fetchPokemonByName(name: string): Promise<Pokemon> {
  try {
    const response = await fetch(`${POKE_API_BASE_URL}/pokemon/${name}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching pokemon with name ${name}:`, error);
    throw error;
  }
}

/**
 * 获取栖息地的中文名称
 * @param habitatUrl 栖息地URL
 * @returns Promise<string>
 */
async function fetchHabitatChineseName(habitatUrl: string): Promise<string> {
  try {
    const response = await fetch(habitatUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const habitatData = await response.json();

    // 过滤出中文名称
    if (habitatData.names) {
      const zhName = habitatData.names.find((name: any) =>
        name.language.name === 'zh-Hans' || name.language.name === 'zh-Hant'
      );
      if (zhName) {
        return zhName.name;
      }
    }
    return habitatData.name;
  } catch (error) {
    console.error('Error fetching habitat chinese name:', error);
    return '';
  }
}

/**
 * 获取宝可梦物种信息（中文）
 * @param id 宝可梦ID
 * @returns Promise<PokemonSpecies>
 */
export async function fetchPokemonSpecies(id: number): Promise<PokemonSpecies> {
  try {
    const response = await fetch(`${POKE_API_BASE_URL}/pokemon-species/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const speciesData = await response.json();

    // 过滤出中文名称
    if (speciesData.names) {
      const zhName = speciesData.names.find((name: any) =>
        name.language.name === 'zh-Hans' || name.language.name === 'zh-Hant'
      );
      if (zhName) {
        speciesData.name = zhName.name;
      }
    }

    // 过滤出中文描述
    if (speciesData.flavor_text_entries) {
      const zhFlavorText = speciesData.flavor_text_entries.find((entry: any) =>
        entry.language.name === 'zh-Hans' || entry.language.name === 'zh-Hant'
      );
      if (zhFlavorText) {
        speciesData.flavor_text = zhFlavorText.flavor_text;
      }
    }

    // 过滤出中文分类
    if (speciesData.genera) {
      const zhGenus = speciesData.genera.find((genus: any) =>
        genus.language.name === 'zh-Hans' || genus.language.name === 'zh-Hant'
      );
      if (zhGenus) {
        speciesData.genus = zhGenus.genus;
      }
    }

    // 获取栖息地的中文名称
    if (speciesData.habitat?.url) {
      speciesData.habitat.chineseName = await fetchHabitatChineseName(speciesData.habitat.url);
    }

    return speciesData;
  } catch (error) {
    console.error(`Error fetching pokemon species with id ${id}:`, error);
    throw error;
  }
}

/**
 * 获取宝可梦图片URL
 * @param id 宝可梦ID
 * @returns string
 */
export function getPokemonImageUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/**
 * 获取宝可梦类型颜色
 * @param type 宝可梦类型
 * @returns string
 */
export function getPokemonTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dark: '#705848',
    dragon: '#7038F8',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };

  return typeColors[type] || '#A8A878';
}

/**
 * 获取宝可梦属性名称的中文翻译
 * @param statName 属性名称
 * @returns string
 */
export function getStatNameTranslation(statName: string): string {
  return statNameMap[statName] || statName;
}

/**
 * 获取宝可梦类型名称的中文翻译
 * @param typeName 类型名称
 * @returns string
 */
export function getTypeNameTranslation(typeName: string): string {
  return typeNameMap[typeName] || typeName;
}

/**
 * 获取宝可梦的中文名称
 * @param pokemon 宝可梦数据
 * @returns string
 */
export function getPokemonChineseName(pokemon: any): string {
  if (pokemon.names) {
    const zhName = pokemon.names.find((name: any) =>
      name.language.name === 'zh-Hans' || name.language.name === 'zh-Hant'
    );
    return zhName ? zhName.name : pokemon.name;
  }
  return pokemon.name;
}

/**
 * 获取进化链信息（包含中文名称和进化条件）
 * @param url 进化链URL
 * @returns Promise<EvolutionChain>
 */
export async function fetchEvolutionChain(url: string): Promise<EvolutionChain> {
  try {
    // 从URL中提取ID: https://pokeapi.co/api/v2/evolution-chain/1/
    const id = url.split('/')[6];
    const response = await fetch(`${POKE_API_BASE_URL}/evolution-chain/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const chainData = await response.json();

    // 处理进化链，添加中文名称
    await processEvolutionChainWithChineseNames(chainData.chain);

    return chainData;
  } catch (error) {
    console.error('Error fetching evolution chain:', error);
    throw error;
  }
}

/**
 * 处理进化链，获取中文名称
 * @param chain 进化链数据
 */
async function processEvolutionChainWithChineseNames(chain: any): Promise<void> {
  // 获取当前物种的中文名称
  if (chain.species?.url) {
    try {
      const speciesResponse = await fetch(chain.species.url);
      if (speciesResponse.ok) {
        const speciesData = await speciesResponse.json();
        const chineseName = getPokemonChineseName(speciesData);
        chain.species.chineseName = chineseName;
      }
    } catch (error) {
      console.error('Error fetching species data:', error);
    }
  }

  // 处理进化条件中的道具中文名称
  if (chain.evolution_details && Array.isArray(chain.evolution_details)) {
    for (const detail of chain.evolution_details) {
      if (detail.item?.url) {
        try {
          const itemResponse = await fetch(detail.item.url);
          if (itemResponse.ok) {
            const itemData = await itemResponse.json();
            const chineseName = getPokemonChineseName(itemData);
            detail.item.chineseName = chineseName;
          }
        } catch (error) {
          console.error('Error fetching item data:', error);
        }
      }

      // 添加进化触发条件的中文名称
      if (detail.trigger?.name) {
        detail.trigger.chineseName = getEvolutionTriggerChineseName(detail.trigger.name);
      }
    }
  }

  // 递归处理后续进化链
  for (const evolution of chain.evolves_to) {
    await processEvolutionChainWithChineseNames(evolution);
  }
}

/**
 * 获取进化触发条件的中文名称
 * @param triggerName 触发条件名称
 * @returns 中文名称
 */
function getEvolutionTriggerChineseName(triggerName: string): string {
  const triggerNameMap: Record<string, string> = {
    'level-up': '等级提升',
    'use-item': '使用道具',
    'trade': '交换',
    'shed': '脱壳',
    'spin': '旋转',
    'tower-of-darkness': '黑暗塔',
    'tower-of-waters': '水源塔',
    'three-critical-hits': '三次暴击',
    'take-damage': '受到伤害',
    'other': '其他',
    'agile-style-move': '敏捷风格招式',
    'strong-style-move': '强力风格招式',
    'recoil-damage': '反伤'
  };

  return triggerNameMap[triggerName] || triggerName;
}

/**
 * 获取宝可梦特性中文名称
 * @param url 特性URL
 * @returns Promise<string>
 */
export async function fetchAbilityName(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const abilityData = await response.json();

    // 过滤出中文名称
    if (abilityData.names) {
      const zhName = abilityData.names.find((name: any) =>
        name.language.name === 'zh-Hans' || name.language.name === 'zh-Hant'
      );
      return zhName ? zhName.name : abilityData.name;
    }
    return abilityData.name;
  } catch (error) {
    console.error('Error fetching ability name:', error);
    throw error;
  }
}