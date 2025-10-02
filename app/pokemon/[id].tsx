import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, Dimensions, Pressable, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { fetchPokemonById, fetchPokemonSpecies, fetchEvolutionChain, fetchAbilityName, getPokemonImageUrl, getPokemonTypeColor, getStatNameTranslation, getTypeNameTranslation } from '@/services/pokemon-service';
import { Pokemon, PokemonSpecies, EvolutionChain, EvolutionDetail } from '@/types/pokemon';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PokemonDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(null);
  const [abilityNames, setAbilityNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (id) {
      loadPokemon(parseInt(id as string));
    }
  }, [id]);

  const loadPokemon = async (pokemonId: number) => {
    try {
      setLoading(true);

      if (isNaN(pokemonId)) {
        throw new Error('无效的宝可梦ID');
      }

      const pokemonData = await fetchPokemonById(pokemonId);
      setPokemon(pokemonData);

      const speciesData = await fetchPokemonSpecies(pokemonId);
      setSpecies(speciesData);

      // 获取进化链数据
      if (speciesData.evolution_chain?.url) {
        const evolutionData = await fetchEvolutionChain(speciesData.evolution_chain.url);
        setEvolutionChain(evolutionData);
      }

      // 获取特性中文名称
      const abilityNameMap: Record<string, string> = {};
      for (const ability of pokemonData.abilities) {
        try {
          const abilityName = await fetchAbilityName(ability.ability.url);
          abilityNameMap[ability.ability.name] = abilityName;
        } catch (err) {
          console.error(`Error fetching ability name for ${ability.ability.name}:`, err);
          abilityNameMap[ability.ability.name] = ability.ability.name;
        }
      }
      setAbilityNames(abilityNameMap);
    } catch (err) {
      setError('获取宝可梦数据失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.simpleHeader, { backgroundColor: '#f8f8f8' }]}>
            <View style={styles.header}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </Pressable>
              <ThemedText type="title" style={styles.headerTitle}>
                宝可梦详情
              </ThemedText>
              <View style={styles.backButton} />
            </View>
          </View>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </ThemedView>
    );
  }

  const renderEvolutionChain = (chain: EvolutionDetail) => {
    // 递归渲染进化链节点
    const renderEvolutionNode = (evolution: EvolutionDetail, level: number = 0, evolutionRequirementText?: string) => {
      const pokemonId = parseInt(evolution.species.url.split('/')[6]);

      return (
        <View key={`${evolution.species.name}-${level}`} style={styles.evolutionItem}>
          <View style={styles.evolutionNodeContainer}>
            {/* 显示进化条件（如果是从上一级传递下来的） */}
            {level > 0 && evolutionRequirementText && (
              <View style={styles.evolutionRequirementContainer}>
                <View style={styles.evolutionRequirement}>
                  <Ionicons name="arrow-forward" size={16} color="#666" />
                  <ThemedText style={styles.evolutionCondition}>
                    {evolutionRequirementText}
                  </ThemedText>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.evolutionImageContainer}
              onPress={() => {
                if (pokemonId !== pokemon?.id) {
                  router.push(`/pokemon/${pokemonId}`);
                }
              }}
            >
              <Image
                source={{ uri: getPokemonImageUrl(pokemonId) }}
                style={styles.evolutionImage}
                contentFit="contain"
              />
              <ThemedText style={styles.evolutionName}>
                {evolution.species.chineseName || evolution.species.name.charAt(0).toUpperCase() + evolution.species.name.slice(1)}
              </ThemedText>
            </TouchableOpacity>

            {/* 渲染所有进化路径 */}
            <View style={styles.evolutionPathsContainer}>
              {evolution.evolves_to.map((nextEvolution, index) => {
                // 获取进化条件 - 从下一级宝可梦的进化详情获取而不是当前级
                // 处理多个进化详情的情况，合并所有条件
                let evolutionRequirements = [];
                if (nextEvolution.evolution_details && Array.isArray(nextEvolution.evolution_details)) {
                  for (const detail of nextEvolution.evolution_details) {
                    const requirementText = getEvolutionRequirementText(detail);
                    if (requirementText) {
                      evolutionRequirements.push(requirementText);
                    }
                  }
                }
                const nextEvolutionRequirementText = evolutionRequirements.join(', ');

                return (
                  <View key={`${nextEvolution.species.name}-${index}`} style={styles.evolutionPath}>
                    <View style={styles.evolutionNextContainer}>
                      {/* 递归渲染下一个宝可梦，将进化条件传递下去 */}
                      {renderEvolutionNode(nextEvolution, level + 1, nextEvolutionRequirementText)}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      );
    };

    return (
      <View style={styles.evolutionContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>进化链</ThemedText>
        <View style={styles.evolutionChain}>
          {renderEvolutionNode(chain)}
        </View>
      </View>
    );
  };

  const getEvolutionRequirementText = (requirement: any): string => {
    const conditions = [];

    // 等级条件
    if (requirement.min_level) {
      conditions.push(`Lv.${requirement.min_level}`);
    }

    // 道具条件
    if (requirement.item?.chineseName) {
      conditions.push(requirement.item.chineseName);
    } else if (requirement.item?.name) {
      conditions.push(requirement.item.name);
    }

    // 快乐度条件
    if (requirement.min_happiness) {
      conditions.push(`亲密度≥${requirement.min_happiness}`);
    }

    // 美丽度条件
    if (requirement.min_beauty) {
      conditions.push(`美丽度≥${requirement.min_beauty}`);
    }

    // 羁绊条件
    if (requirement.min_affection) {
      conditions.push(`羁绊≥${requirement.min_affection}`);
    }

    // 时间条件
    if (requirement.time_of_day && requirement.time_of_day !== '') {
      const timeMap: Record<string, string> = {
        'day': '白天',
        'night': '夜晚'
      };
      conditions.push(timeMap[requirement.time_of_day] || requirement.time_of_day);
    }

    // 地点条件
    if (requirement.location?.name) {
      conditions.push(`地点:${requirement.location.name}`);
    }

    // 招式条件
    if (requirement.known_move?.name) {
      conditions.push(`学会招式:${requirement.known_move.name}`);
    }

    // 招式类型条件
    if (requirement.known_move_type?.name) {
      conditions.push(`招式类型:${getTypeNameTranslation(requirement.known_move_type.name)}`);
    }

    // 队伍条件
    if (requirement.party_species?.name) {
      conditions.push(`队伍有:${requirement.party_species.name}`);
    }

    // 队伍类型条件
    if (requirement.party_type?.name) {
      conditions.push(`队伍有${getTypeNameTranslation(requirement.party_type.name)}系`);
    }

    // 天气条件
    if (requirement.needs_overworld_rain) {
      conditions.push('下雨时');
    }

    // 进化触发条件
    if (requirement.trigger?.chineseName) {
      conditions.push(requirement.trigger.chineseName);
    } else if (requirement.trigger?.name) {
      conditions.push(requirement.trigger.name);
    }

    return conditions.join(' ');
  };

  if (error || !pokemon) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.simpleHeader, { backgroundColor: '#f8f8f8' }]}>
            <View style={styles.header}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </Pressable>
              <ThemedText type="title" style={styles.headerTitle}>
                宝可梦详情
              </ThemedText>
              <View style={styles.backButton} />
            </View>
          </View>
        </SafeAreaView>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>错误: {error || '未找到宝可梦'}</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const backgroundColor = getPokemonTypeColor(primaryType);
  const chineseName = species?.name || pokemon.name;
  const typeColors = pokemon.types.map(type => getPokemonTypeColor(type.type.name));


  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* 页面标题栏 - 会滚动并吸顶 */}
        <Animated.View style={[
          styles.simpleHeader,
          {
            backgroundColor: backgroundColor,
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [0, -100],
                extrapolate: 'clamp',
              })
            }]
          }
        ]}>
          <SafeAreaView>
            <View style={styles.header}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </Pressable>
              <ThemedText type="title" style={[styles.headerTitle, styles.headerTitleWhite]}>
                {chineseName}
              </ThemedText>
              <View style={styles.backButton} />
            </View>
          </SafeAreaView>
        </Animated.View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getPokemonImageUrl(pokemon.id) }}
            style={styles.image}
            contentFit="contain"
          />
        </View>

      <View style={styles.infoContainer}>
        <View style={styles.typesContainer}>
          {pokemon.types.map((type) => (
            <View
              key={type.type.name}
              style={[styles.typeBadge, { backgroundColor: getPokemonTypeColor(type.type.name) }]}
            >
              <ThemedText style={styles.typeText}>
                {getTypeNameTranslation(type.type.name)}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>属性</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>身高</ThemedText>
              <ThemedText style={[styles.statValue, { width: 'auto', flex: 1 }]}>{(pokemon.height / 10).toFixed(1)} m</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>体重</ThemedText>
              <ThemedText style={[styles.statValue, { width: 'auto', flex: 1 }]}>{(pokemon.weight / 10).toFixed(1)} kg</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.abilitiesContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>特性</ThemedText>
          <View style={styles.abilitiesList}>
            {pokemon.abilities.map((ability) => (
              <View key={ability.ability.name} style={styles.abilityItem}>
                <ThemedText style={styles.abilityName}>
                  {abilityNames[ability.ability.name] || ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1).replace('-', ' ')}
                </ThemedText>
                {ability.is_hidden && (
                  <ThemedText style={styles.hiddenAbility}>(隐藏特性)</ThemedText>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>种族值</ThemedText>
          {pokemon.stats.map((stat) => (
            <View key={stat.stat.name} style={styles.statRow}>
              <ThemedText style={styles.statName}>
                {getStatNameTranslation(stat.stat.name)}
              </ThemedText>
              <ThemedText style={styles.statValue}>{stat.base_stat}</ThemedText>
              <View style={styles.statBarContainer}>
                <View
                  style={[
                    styles.statBar,
                    {
                      width: `${Math.min(100, (stat.base_stat / 255) * 100)}%`,
                      backgroundColor: getPokemonTypeColor(primaryType)
                    }
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {species && (
          <View style={styles.speciesContainer}>
            {species.genus && (
              <>
                <ThemedText type="subtitle" style={styles.sectionTitle}>分类</ThemedText>
                <View style={styles.speciesInfo}>
                  <View style={styles.speciesItem}>
                    <ThemedText style={styles.statLabel}>分类</ThemedText>
                    <ThemedText style={styles.statValue}>{species.genus}</ThemedText>
                  </View>
                </View>
              </>
            )}

            {species.flavor_text && (
              <>
                <ThemedText type="subtitle" style={styles.sectionTitle}>描述</ThemedText>
                <View style={styles.descriptionContainer}>
                  <ThemedText style={styles.descriptionText}>
                    {species.flavor_text.replace(/\f/g, ' ')}
                  </ThemedText>
                </View>
              </>
            )}

            <ThemedText type="subtitle" style={styles.sectionTitle}>生态</ThemedText>
            <View style={styles.speciesInfo}>
              <View style={styles.speciesItem}>
                <ThemedText style={styles.statLabel}>捕获率</ThemedText>
                <ThemedText style={styles.statValue}>{species.capture_rate}</ThemedText>
              </View>
              {species.habitat && (
                <View style={styles.speciesItem}>
                  <ThemedText style={styles.statLabel}>栖息地</ThemedText>
                  <ThemedText style={styles.statValue}>
                    {species.habitat.chineseName || species.habitat.name.charAt(0).toUpperCase() + species.habitat.name.slice(1)}
                  </ThemedText>
                </View>
              )}
              <View style={styles.speciesItem}>
                <ThemedText style={styles.statLabel}>稀有度</ThemedText>
                <ThemedText style={styles.statValue}>
                  {species.is_legendary ? '传说' : species.is_mythical ? '神话' : '普通'}
                </ThemedText>
              </View>
            </View>

            {/* 进化链展示 */}
            {evolutionChain && renderEvolutionChain(evolutionChain.chain)}
          </View>
        )}
      </View>
    </Animated.ScrollView>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  simpleHeader: {
    height: 60,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerTitleWhite: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: width * 0.6,
    height: width * 0.6,
  },
  infoContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    minHeight: 400,
  },
  typesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  typeText: {
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    marginBottom: 10,
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  abilitiesContainer: {
    marginBottom: 20,
  },
  abilitiesList: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
  },
  abilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  abilityName: {
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
  },
  hiddenAbility: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statName: {
    width: 80,
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    width: 40,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  statBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginHorizontal: 10,
  },
  statBar: {
    height: '100%',
    borderRadius: 3,
  },
  speciesContainer: {
    marginBottom: 20,
  },
  speciesInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  speciesItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  descriptionContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    textAlign: 'justify',
  },
  evolutionContainer: {
    marginTop: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
  },
  evolutionChain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  evolutionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evolutionImageContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  evolutionImage: {
    width: 60,
    height: 60,
  },
  evolutionName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '600',
  },
  evolutionNodeContainer: {
    alignItems: 'center',
  },
  evolutionPathsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  evolutionPath: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  evolutionNextContainer: {
    flexDirection: 'row',
  },
  evolutionRequirementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  evolutionRequirement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  evolutionCondition: {
    fontSize: 10,
    color: '#666',
    marginLeft: 3,
    maxWidth: 80,
    textAlign: 'center',
  },
  arrowIcon: {
    marginHorizontal: 5,
  },
});