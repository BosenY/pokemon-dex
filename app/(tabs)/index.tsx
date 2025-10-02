import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { fetchPokemonById, fetchPokemonList, fetchPokemonSpecies, getPokemonImageUrl, getPokemonTypeColor, getTypeNameTranslation } from '@/services/pokemon-service';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PokemonListItem {
  id: number;
  name: string;
  url: string;
  types?: string[];
  chineseName?: string;
}

export default function HomeScreen() {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // 用于防止重复触发加载
  const isLoadingMore = useRef(false);

  const limit = 20;

  const loadPokemon = useCallback(async (loadMore = false) => {
    // 防止重复加载
    if (loadMore) {
      if (!hasMore || isLoadingMore.current) return;
      isLoadingMore.current = true;
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetchPokemonList(limit, loadMore ? offset : 0);

      const pokemonData = response.results.map((pokemon) => {
        // 从URL中提取ID: https://pokeapi.co/api/v2/pokemon/1/
        const id = parseInt(pokemon.url.split('/')[6]);
        return {
          id,
          name: pokemon.name,
          url: pokemon.url,
        };
      });

      // 获取每个宝可梦的详细信息以获取类型和中文名称
      const pokemonWithTypes = await Promise.all(
        pokemonData.map(async (pokemon) => {
          try {
            const details = await fetchPokemonById(pokemon.id);
            const species = await fetchPokemonSpecies(pokemon.id);
            return {
              ...pokemon,
              types: details.types.map((type: any) => type.type.name),
              chineseName: species.name || pokemon.name,
            };
          } catch (err) {
            console.error(`Error fetching details for pokemon ${pokemon.id}:`, err);
            return pokemon;
          }
        })
      );

      if (loadMore) {
        // 确保不添加重复的宝可梦
        const existingIds = new Set(pokemonList.map(p => p.id));
        const newUniquePokemon = pokemonWithTypes.filter(p => !existingIds.has(p.id));
        setPokemonList(prev => [...prev, ...newUniquePokemon]);
      } else {
        setPokemonList(pokemonWithTypes);
      }

      setOffset(loadMore ? offset + limit : limit);
      setHasMore(response.next !== null);
    } catch (err) {
      setError('获取宝可梦数据失败');
      console.error(err);
    } finally {
      if (loadMore) {
        isLoadingMore.current = false;
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [offset, hasMore, pokemonList]);

  useEffect(() => {
    loadPokemon();
  }, []);

  const handleLoadMore = useCallback(() => {
    // 添加额外的检查以防止重复加载
    if (hasMore && !loadingMore && !isLoadingMore.current) {
      loadPokemon(true);
    }
  }, [hasMore, loadingMore, loadPokemon]);

  const renderPokemonItem = ({ item }: { item: PokemonListItem }) => {
    return (
      <Link href={`/pokemon/${item.id}`} asChild>
        <Pressable
          style={({ pressed }) => [
            styles.pokemonCard,
            pressed && styles.pokemonCardPressed
          ]}
        >
          <View style={styles.pokemonInfoContainer}>
            <View style={styles.pokemonInfo}>
              <View style={styles.pokemonHeader}>
                <ThemedText style={styles.pokemonId}>#{item.id.toString().padStart(3, '0')}</ThemedText>
                <ThemedText style={styles.pokemonName}>
                  {item.chineseName || item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </ThemedText>
              </View>
              <ThemedText style={styles.pokemonNameEn}>
                {item.name}
              </ThemedText>
              {item.types && item.types.length > 0 && (
                <View style={styles.typesContainer}>
                  {item.types.map((type) => (
                    <View
                      key={type}
                      style={[styles.typeBadge, { backgroundColor: getPokemonTypeColor(type) }]}
                    >
                      <ThemedText style={styles.typeText}>
                        {getTypeNameTranslation(type)}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.pokemonImageContainer}>
              <Image
                source={{ uri: getPokemonImageUrl(item.id) }}
                style={styles.pokemonImage}
                contentFit="contain"
              />
            </View>
          </View>
        </Pressable>
      </Link>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  if (loading && pokemonList.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.headerTitle}>
              宝可梦图鉴
            </ThemedText>
          </View>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" style={styles.loading} />
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.headerTitle}>
              宝可梦图鉴
            </ThemedText>
          </View>
        </SafeAreaView>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>错误: {error}</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            宝可梦图鉴
          </ThemedText>
        </View>
      </SafeAreaView>
      <FlatList
        data={pokemonList}
        renderItem={({ item, index }) => (
          <>
            {renderPokemonItem({ item })}
            {index < pokemonList.length - 1 && <View style={styles.separator} />}
          </>
        )}
        keyExtractor={(item) => `pokemon-${item.id}`}
        contentContainerStyle={styles.listContainer}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  safeArea: {
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
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
    marginTop: 20,
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  pokemonCard: {
    marginVertical: 10,
    marginHorizontal: 25,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pokemonCardPressed: {
    backgroundColor: '#f0f0f0',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
    marginVertical: 5,
  },
  pokemonInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
  },
  pokemonInfo: {
    flex: 1,
  },
  pokemonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pokemonId: {
    fontSize: 11,
    color: '#888',
    marginRight: 10,
    fontFamily: 'monospace',
  },
  pokemonImageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pokemonImage: {
    width: 65,
    height: 65,
  },
  pokemonName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  pokemonNameEn: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: 5,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});