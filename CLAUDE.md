# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an Expo React Native project using Expo Router for file-based routing. The app is a Pokémon Pokédex that displays information about Pokémon, including their stats, abilities, evolutions, and more. The app follows a tab-based navigation pattern with a home screen (Pokémon list) and explore screen (about page).

## Pokémon Project Specifics
- Uses PokeAPI (https://pokeapi.co/api/v2/) as the data source
- All content should be displayed in Chinese
- Implements infinite scrolling on the home screen for Pokémon list
- Displays detailed Pokémon information including stats, abilities, evolution chains, and species information
- Evolution chains show Chinese names and evolution requirements
- Images are loaded from official Pokémon artwork
- Implements proper caching and error handling for API calls
- Handles multiple evolution paths and branching evolutions
- Shows detailed evolution requirements (level, items, happiness, etc.)
- Displays Pokémon types with appropriate colors
- Shows Pokémon abilities with hidden ability indicators

## Common Development Commands
- Install dependencies: `npm install`
- Start development server: `npx expo start`
- Run on iOS: `npx expo start --ios`
- Run on Android: `npx expo start --android`
- Run on Web: `npx expo start --web`
- Lint code: `npm run lint`

## Development Best Practices
- Always use TypeScript for type safety
- Follow the existing code style and component structure
- Use the existing service layer for API calls rather than making direct fetch calls
- Implement proper error handling and loading states for all async operations
- Use the theme-aware components (ThemedText, ThemedView) for consistent styling
- Test changes on both light and dark modes
- Ensure proper accessibility attributes are used
- Use appropriate keys for list rendering
- Implement proper image loading with fallbacks
- Handle edge cases like network errors and empty states

## Project Structure
- `app/` - Main application screens using file-based routing
  - `app/(tabs)/` - Tab-based screens (home and explore)
  - `app/_layout.tsx` - Root layout with theme provider
  - `app/modal.tsx` - Modal screen example
- `components/` - Shared UI components
- `constants/` - Theme and configuration constants
- `hooks/` - Custom React hooks
- `assets/` - Static assets like images

## Architecture Patterns
- Uses Expo Router for file-based routing
- Implements a tab-based navigation system
- Follows a theme-based styling approach with light/dark modes
- Uses path aliases (@/*) for imports
- Component structure follows React best practices with TypeScript
- Implements infinite scrolling with FlatList for performance
- Uses React Native Gesture Handler for touch interactions
- Follows a service layer pattern for API calls
- Implements proper error handling and loading states

## Key Dependencies
- Expo for cross-platform development
- React Navigation for navigation
- React Native Reanimated for animations
- Expo Image for image handling