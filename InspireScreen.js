import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Sample video data from the provided YouTube links
const VIDEOS = [
  {
    id: '1',
    title: 'How I Study 14 Hours a Day (MY STUY SECRETS)',
    channel: 'Sam Hall',
    views: '1.2M views',
    publishedAt: '3 weeks ago',
    thumbnail: 'https://i.ytimg.com/vi/_Ep1dfk12ec/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=_Ep1dfk12ec',
    channelAvatar: 'https://yt3.googleusercontent.com/ytc/AOPolaT2TW9ZYEVXHX_8Z1Qz4MFJXE0X7TROnE--EVcQ=s176-c-k-c0x00ffffff-no-rj',
    duration: '12:31'
  },
  {
    id: '2',
    title: 'How to Study 10 Hours Per Day - The Power of Habit',
    channel: "Matt D'Avella",
    views: '2.6M views',
    publishedAt: '2 months ago',
    thumbnail: 'https://i.ytimg.com/vi/EnP5ux2Hf9k/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=EnP5ux2Hf9k',
    channelAvatar: 'https://yt3.googleusercontent.com/ytc/AOPolaQ6i5Gvrihw202tyF-g-DFbXUAz-bYw4SpH9WIQ=s176-c-k-c0x00ffffff-no-rj',
    duration: '14:40'
  },
  {
    id: '3',
    title: 'How I Schedule My Day as a Student | How to Be Productive',
    channel: 'Elliot Choy',
    views: '1.7M views',
    publishedAt: '8 months ago',
    thumbnail: 'https://i.ytimg.com/vi/mZKwBAu8OEc/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=mZKwBAu8OEc',
    channelAvatar: 'https://yt3.googleusercontent.com/ytc/AOPolaTOzxEuQZ0woeV1pqF8JcTaJ5EldL9CMi7I2Q1W=s176-c-k-c0x00ffffff-no-rj',
    duration: '10:04'
  },
  {
    id: '4',
    title: '12 Proven Steps to Study Effectively',
    channel: "Mariana's Corner",
    views: '3.4M views',
    publishedAt: '1 year ago',
    thumbnail: 'https://i.ytimg.com/vi/b10OiAIYze0/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=b10OiAIYze0',
    channelAvatar: 'https://yt3.googleusercontent.com/V4FqOiZ7bzHIQY55q7plKo3CC5JqiLwEIHTeHgdsQDODVxDEwtNf-bwpQrBNgUUwtST9BkWN=s176-c-k-c0x00ffffff-no-rj',
    duration: '15:56'
  },
];

// Categories for video filter (similar to YouTube)
const CATEGORIES = [
  'All',
  'Study Tips',
  'Productivity',
  'Time Management',
  'Note Taking',
  'Memory Techniques',
  'Exam Prep',
  'Focus Music'
];

export default function InspireScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem, 
        selectedCategory === item && styles.selectedCategoryItem
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryText, 
        selectedCategory === item && styles.selectedCategoryText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );
  
  const handleVideoPress = (videoUrl) => {
    Linking.openURL(videoUrl);
  };
  
  const renderVideoItem = ({ item }) => (
    <View style={styles.videoCard}>
      <TouchableOpacity onPress={() => handleVideoPress(item.videoUrl)}>
        <View style={styles.videoContainer}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.videoInfo}>
        <Image source={{ uri: item.channelAvatar }} style={styles.channelAvatar} />
        <View style={styles.videoDetails}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.channelName}>
            {item.channel}
          </Text>
          <View style={styles.videoStats}>
            <Text style={styles.viewCount}>{item.views}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.publishDate}>{item.publishedAt}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ClassX Inspire</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
        />
      </View>
      
      {/* Videos */}
      <FlatList
        data={VIDEOS}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6A3EA1',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 20,
  },
  categoriesContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesList: {
    paddingHorizontal: 12,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryItem: {
    backgroundColor: '#6A3EA1',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  videoCard: {
    marginBottom: 16,
  },
  videoContainer: {
    position: 'relative',
    width: width,
    height: width * (9 / 16), // 16:9 aspect ratio
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  durationBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  videoInfo: {
    flexDirection: 'row',
    padding: 12,
  },
  channelAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  videoDetails: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 14,
    color: '#606060',
    marginBottom: 2,
  },
  videoStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCount: {
    fontSize: 14,
    color: '#606060',
  },
  dot: {
    fontSize: 14,
    color: '#606060',
    marginHorizontal: 4,
  },
  publishDate: {
    fontSize: 14,
    color: '#606060',
  },
  menuButton: {
    padding: 4,
  },
});
