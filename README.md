# 👾 Space Invaders Game

A classic Space Invaders game built with HTML5 Canvas and JavaScript, featuring dynamic levels, sound effects, and high score tracking.

🎮 **[Play the Game Live](https://fabulous-choux-255ed1.netlify.app/)**

## ✨ Features

- 🎯 **Dynamic Enemy Generation**: Randomized enemy formations that scale with level progression
- 📈 **Progressive Difficulty**: Enemy speed and shooting frequency increase with each level
- 🔊 **Sound Effects**: Mix of Web Audio API synthesized sounds and custom MP3 files
- 🏆 **High Score System**: Persistent high score storage using localStorage
- 🎮 **Game States**: Level screens, pause functionality, and game over handling
- ⚡ **Optimized Rendering**: Efficient sprite system and collision detection

## 🎮 Controls

- ⬅️➡️ **Arrow Keys**: Move player left/right
- 🚀 **Spacebar**: Shoot bullets / Start level / Continue to next level
- ⏸️ **P**: Pause/Resume game
- 🚪 **Q**: Quit game (when paused or on level screen)
- 🔄 **R**: Restart game (when game over)

## File Structure

```
├── index.html          # Main HTML file with canvas and UI elements
├── game.js            # Core game logic and mechanics
├── gameover.mp3       # Game over sound effect
├── levelup.mp3        # Level completion sound effect
├── player.png         # Player sprite (optional)
└── enemy.png          # Enemy sprite (optional)
```

## 🚀 Development Process

This game was developed with assistance from **Amazon Q Developer**, an AI coding assistant that helped with:

- 🏗️ **Code Architecture**: Structuring the game loop and state management
- 🐛 **Bug Fixes**: Resolving array iteration issues and collision detection problems
- 🎵 **Sound Integration**: Implementing both Web Audio API and MP3 file support
- ⚡ **Performance Optimization**: Improving rendering efficiency and memory management
- 🎯 **Feature Enhancement**: Adding dynamic difficulty scaling and game state handling

### 🤖 Amazon Q Developer Integration

Amazon Q Developer was instrumental in:
1. 🚀 **Rapid Prototyping**: Quickly implementing core game mechanics
2. 🔍 **Code Review**: Identifying and fixing critical bugs like array splicing issues
3. 🎨 **Feature Development**: Adding sound effects, level progression, and UI improvements
4. ✅ **Best Practices**: Ensuring proper error handling and browser compatibility

Learn more about Amazon Q Developer: [https://aws.amazon.com/q/developer/](https://aws.amazon.com/q/developer/)

## 🛠️ Setup Instructions

1. 📥 Clone or download the project files
2. 📁 Ensure all files are in the same directory
3. 🎵 Add your custom sound files (`gameover.mp3`, `levelup.mp3`) if desired
4. 🌐 Open `index.html` in a modern web browser
5. 🔊 Click anywhere on the page to enable audio context
6. 🚀 Press Spacebar to start playing

## 🔧 Technical Details

- 🎨 **Canvas Rendering**: 2D context with optimized drawing operations
- 💥 **Collision Detection**: AABB (Axis-Aligned Bounding Box) collision system
- 🎵 **Audio System**: Hybrid approach using Web Audio API for synthesized sounds and HTML5 Audio for custom files
- 🎮 **State Management**: Clean separation of game states (playing, paused, level complete, game over)
- ⚡ **Performance**: Efficient array operations and minimal DOM manipulation

## 🌐 Browser Compatibility

- ✅ Modern browsers with HTML5 Canvas support
- 🔊 Web Audio API support for synthesized sounds
- 💾 localStorage support for high score persistence

---

*Developed with Amazon Q Developer - AI-powered coding assistant*
