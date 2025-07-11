# 🎱 Billiards Analytics

A real-time mobile web application for tracking billiards/pool game analytics, timing, and player performance statistics.

## Features

### Core Functionality
- **Real-time Timing**: Track time between every action (shots, switches, fouls)
- **Player Management**: Automatic turn switching and break tracking
- **Action Tracking**: Three main buttons for different game events:
  - 🎯 **SHOT**: When a ball is potted (player continues)
  - 🔄 **SWITCH**: When player misses (turn changes)
  - ⚠️ **FOUL**: When a foul is committed (turn changes)

### Analytics & Visualization
- **Real-time Chart**: Visual representation of shot timing patterns
- **Live Statistics**: Continuously updated player stats
- **Performance Metrics**: Efficiency, consistency, and comparison data
- **Game History**: Complete log of all actions with timestamps

### Statistics Tracked
- Total shots per player
- Average shot time
- Break counts and longest breaks
- Foul tracking
- Fastest and slowest shots
- Player efficiency percentages
- Game duration and activity log

### Mobile-First Design
- Portrait orientation optimized for smartphones
- Touch-friendly large buttons
- Responsive design that adapts to screen sizes
- PWA capabilities for installation as native app
- Prevents accidental zoom and context menus

## How to Use

### Getting Started
1. Open the app in your mobile browser
2. Game automatically starts with Player 1
3. Use the three action buttons to track gameplay

### During Gameplay
- **When a player pots a ball**: Press 🎯 SHOT
  - Continues the current player's break
  - Records timing and updates statistics
  
- **When a player misses**: Press 🔄 SWITCH
  - Ends current player's break
  - Switches turn to the other player
  
- **When a foul occurs**: Press ⚠️ FOUL
  - Records foul for current player
  - Ends break and switches turn

### Game Controls
- **New Game**: Reset all statistics and start fresh
- **Pause/Resume**: Pause timing (useful for breaks)
- **Detailed Stats**: View comprehensive analytics modal

## Technical Details

### Files Structure
```
├── index.html          # Main application HTML
├── styles.css          # Mobile-first CSS styling
├── script.js           # Core analytics and game logic
├── manifest.json       # PWA manifest for mobile installation
└── README.md          # This documentation
```

### Key Technologies
- **Vanilla JavaScript**: No external dependencies
- **HTML5 Canvas**: Real-time chart visualization
- **CSS Grid/Flexbox**: Responsive mobile layout
- **PWA Standards**: Installable web app
- **Local Storage**: Game state persistence (future enhancement)

### Browser Compatibility
- Chrome/Edge (recommended)
- Safari (iOS/macOS)
- Firefox
- Any modern mobile browser

## Installation as Mobile App

### Android (Chrome)
1. Open the app in Chrome browser
2. Tap the menu (⋮) and select "Add to Home screen"
3. Confirm installation
4. App will appear as native app icon

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button (□↗)
3. Scroll down and tap "Add to Home Screen"
4. Confirm to add app icon

## Statistics Explained

### Basic Metrics
- **Shots**: Total successful shots (balls potted)
- **Avg Time**: Average time between actions
- **Breaks**: Number of completed breaks
- **Fouls**: Total fouls committed

### Advanced Analytics
- **Efficiency**: (Shots / Total Actions) × 100
- **Consistency**: Range between fastest and slowest shots
- **Break Performance**: Longest break and break frequency
- **Time Patterns**: Visual chart showing timing trends

### Real-time Visualization
The chart displays the last 20 actions with:
- Green dots: Player 1 actions
- Orange dots: Player 2 actions  
- Red dots: Fouls
- Connected lines showing timing trends

## Customization & Future Enhancements

### Potential Features
- Custom player names
- Score tracking integration
- Game format selection (8-ball, 9-ball, snooker)
- Export statistics to CSV
- Multiple game session tracking
- Advanced analytics (pressure situations, comeback tracking)
- Sound effects and haptic feedback

### Performance Optimization
- Efficient canvas rendering
- Memory management for long games
- Offline functionality with service workers

## License

This project is open source and available under the MIT License.

## Support

For issues, feature requests, or questions, please create an issue in the project repository.

---

**Developed for mobile billiards enthusiasts who want to analyze and improve their game through data-driven insights.**