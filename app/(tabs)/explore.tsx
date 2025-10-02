import { StyleSheet, View, StatusBar } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            关于宝可梦图鉴
          </ThemedText>
        </View>
      </SafeAreaView>

      <ThemedView style={styles.content}>
        <ThemedText style={styles.paragraph}>
          欢迎使用宝可梦图鉴应用！这是一个基于 Expo 和 React Native 开发的移动应用程序，
          旨在为宝可梦爱好者提供一个简洁、易用的宝可梦信息查询工具。
        </ThemedText>

        <ThemedText type="subtitle" style={styles.subtitle}>
          技术栈
        </ThemedText>

        <View style={styles.techList}>
          <ThemedText style={styles.techItem}>• React Native</ThemedText>
          <ThemedText style={styles.techItem}>• Expo</ThemedText>
          <ThemedText style={styles.techItem}>• TypeScript</ThemedText>
          <ThemedText style={styles.techItem}>• React Navigation</ThemedText>
          <ThemedText style={styles.techItem}>• PokeAPI</ThemedText>
        </View>

        <ThemedText type="subtitle" style={styles.subtitle}>
          功能特性
        </ThemedText>

        <View style={styles.featureList}>
          <ThemedText style={styles.featureItem}>• 浏览所有宝可梦</ThemedText>
          <ThemedText style={styles.featureItem}>• 查看宝可梦详细信息</ThemedText>
          <ThemedText style={styles.featureItem}>• 无限滚动加载</ThemedText>
          <ThemedText style={styles.featureItem}>• 深色模式支持</ThemedText>
        </View>

        <ThemedText type="subtitle" style={styles.subtitle}>
          数据来源
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          本应用的所有宝可梦数据均来自 PokeAPI V2，这是一个免费的、开源的宝可梦数据 API。
        </ThemedText>

        <ThemedText type="subtitle" style={styles.subtitle}>
          开发者信息
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          这是一个开源项目，旨在展示如何使用 Expo 和 React Native 构建跨平台移动应用。
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
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
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  paragraph: {
    lineHeight: 22,
    marginBottom: 15,
    fontSize: 16,
  },
  techList: {
    marginBottom: 15,
  },
  techItem: {
    lineHeight: 22,
    marginLeft: 10,
    fontSize: 16,
  },
  featureList: {
    marginBottom: 15,
  },
  featureItem: {
    lineHeight: 22,
    marginLeft: 10,
    fontSize: 16,
  },
});