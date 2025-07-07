const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let score = 0;
let lives = 3;
let gameOver = false;
let level = 1;
let levelComplete = false;
let showLevelScreen = true;
let paused = false;
let quit = false;
let highScore = localStorage.getItem('spaceInvadersHighScore') || 0;

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 40,
    speed: 5
};

// Arrays for game objects
let bullets = [];
let enemies = [];
let enemyBullets = [];

// Enemy movement state
let enemyDirection = 1; // 1 for right, -1 for left
let enemySpeed = 1;

// Input handling
const keys = {};

// Optimized sprite system
const playerSprite = new Image();
const enemySprite = new Image();
let playerSpriteLoaded = false;
let enemySpriteLoaded = false;

// Sound effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const sounds = {
    shoot: () => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain).connect(audioContext.destination);
        osc.frequency.setValueAtTime(800, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    },
    enemyHit: () => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain).connect(audioContext.destination);
        osc.frequency.setValueAtTime(200, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);
        gain.gain.setValueAtTime(0.4, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        osc.start();
        osc.stop(audioContext.currentTime + 0.2);
    },
    playerHit: () => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain).connect(audioContext.destination);
        osc.frequency.setValueAtTime(150, audioContext.currentTime);
        gain.gain.setValueAtTime(0.5, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc.start();
        osc.stop(audioContext.currentTime + 0.3);
    },
    gameOver: new Audio('gameover.mp3'),
    levelUp: new Audio('levelup.mp3')
};

// Load sprites once
playerSprite.onload = () => { playerSpriteLoaded = true; };
enemySprite.onload = () => { enemySpriteLoaded = true; };
playerSprite.src = 'player.png';
enemySprite.src = 'enemy.png';

// Initialize enemies based on level with randomization
function createEnemies() {
    enemies = [];
    
    // Base rows + random additional rows + level scaling
    let baseRows = 2 + Math.floor(level / 3); // Increases every 3 levels
    let randomRows = Math.floor(Math.random() * 3) + 1; // 1-3 random rows
    let totalRows = Math.min(baseRows + randomRows, 8); // Cap at 8 rows
    
    // Random columns between 8-12
    let cols = Math.floor(Math.random() * 5) + 8;
    
    for (let row = 0; row < totalRows; row++) {
        for (let col = 0; col < cols; col++) {
            enemies.push({
                x: col * 70 + 50,
                y: row * 45 + 50,
                width: 40,
                height: 35,
                alive: true
            });
        }
    }
    
    // Set speed based on level
    enemySpeed = 1 + (level - 1) * 0.3;
    enemyDirection = 1;
}

// Draw functions
function drawPlayer() {
    if (playerSpriteLoaded) {
        ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = '#0f0';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.fillRect(player.x + 15, player.y - 15, 20, 15);
    }
}

function drawEnemies() {
    if (enemySpriteLoaded) {
        // Optimized: batch draw sprites
        enemies.forEach(enemy => {
            if (enemy.alive) {
                ctx.drawImage(enemySprite, enemy.x, enemy.y, enemy.width, enemy.height);
            }
        });
    } else {
        // Optimized: set fill style once
        ctx.fillStyle = '#f00';
        enemies.forEach(enemy => {
            if (enemy.alive) {
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                ctx.fillRect(enemy.x + 8, enemy.y - 8, 24, 8);
                ctx.fillRect(enemy.x + 12, enemy.y + 35, 16, 8);
            }
        });
    }
}

function drawBullets() {
    // Optimized: only set style if bullets exist
    if (bullets.length > 0) {
        ctx.fillStyle = '#0f0';
        bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, 3, 10);
        });
    }
    
    if (enemyBullets.length > 0) {
        ctx.fillStyle = '#f00';
        enemyBullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, 3, 10);
        });
    }
}

function drawUI() {
    // Optimized: set text properties once and cache enemy count
    ctx.fillStyle = '#0f0';
    ctx.font = '16px Courier New';
    ctx.textAlign = 'left';
    
    // Cache enemy count to avoid filtering every frame
    const aliveCount = enemies.reduce((count, enemy) => enemy.alive ? count + 1 : count, 0);
    
    ctx.fillText(`Enemies: ${aliveCount}`, 10, 30);
    ctx.fillText(`Speed: ${enemySpeed.toFixed(1)}`, 10, 50);
    ctx.fillText(`High Score: ${highScore}`, 10, 70);
}

// Update functions
function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.y -= 7;
        return bullet.y > 0;
    });
    
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += 5;
        return bullet.y < canvas.height;
    });
}

function updateEnemies() {
    let hitEdge = false;
    const aliveEnemies = enemies.filter(e => e.alive);
    
    if (aliveEnemies.length > 0) {
        let leftmost = Math.min(...aliveEnemies.map(e => e.x));
        let rightmost = Math.max(...aliveEnemies.map(e => e.x + e.width));
        
        if ((enemyDirection === 1 && rightmost >= canvas.width - 10) || 
            (enemyDirection === -1 && leftmost <= 10)) {
            hitEdge = true;
        }
    }
    
    if (hitEdge) {
        enemyDirection *= -1;
        enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.y += 25;
            }
        });
    } else {
        enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.x += enemyDirection * enemySpeed;
            }
        });
    }
    
    // Increased shooting frequency based on level
    let shootChance = 0.01 + (level * 0.005);
    if (Math.random() < shootChance) {
        const aliveEnemies = enemies.filter(e => e.alive);
        if (aliveEnemies.length > 0) {
            const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
            enemyBullets.push({
                x: shooter.x + shooter.width / 2,
                y: shooter.y + shooter.height
            });
        }
    }
}

function checkCollisions() {
    // Use reverse iteration to avoid index issues when splicing
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (enemy.alive && 
                bullet.x < enemy.x + enemy.width &&
                bullet.x + 3 > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + 10 > enemy.y) {
                
                enemy.alive = false;
                bullets.splice(i, 1);
                score += 10 + level;
                sounds.enemyHit();
                if (document.getElementById('score')) {
                    document.getElementById('score').textContent = score;
                }
                
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('spaceInvadersHighScore', highScore);
                    if (document.getElementById('highScore')) {
                        document.getElementById('highScore').textContent = highScore;
                    }
                }
                break;
            }
        }
    }
    
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        if (bullet.x < player.x + player.width &&
            bullet.x + 3 > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + 10 > player.y) {
            
            enemyBullets.splice(i, 1);
            lives--;
            sounds.playerHit();
            if (document.getElementById('lives')) {
                document.getElementById('lives').textContent = lives;
            }
            
            if (lives <= 0) {
                gameOver = true;
                sounds.gameOver.currentTime = 0;
                sounds.gameOver.play().catch(() => {});
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('spaceInvadersHighScore', highScore);
                    if (document.getElementById('highScore')) {
                        document.getElementById('highScore').textContent = highScore;
                    }
                }
            }
        }
    }
    
    if (enemies.every(enemy => !enemy.alive)) {
        levelComplete = true;
        sounds.levelUp.currentTime = 0;
        sounds.levelUp.play().catch(() => {});
    }
    
    enemies.forEach(enemy => {
        if (enemy.alive && enemy.y + enemy.height >= player.y) {
            gameOver = true;
            sounds.gameOver.currentTime = 0;
            sounds.gameOver.play().catch(() => {});
        }
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (quit) {
        ctx.fillStyle = '#0f0';
        ctx.font = '48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('GAME QUIT', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '32px Courier New';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Courier New';
        ctx.fillText(`Level Reached: ${level}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 70);
        ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 100);
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (paused) {
        ctx.fillStyle = '#0f0';
        ctx.font = '48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Courier New';
        ctx.fillText('Press P to Resume', canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText('Press Q to Quit', canvas.width / 2, canvas.height / 2 + 80);
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (showLevelScreen) {
        ctx.fillStyle = '#0f0';
        ctx.font = '48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL ${level}`, canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '24px Courier New';
        ctx.fillText(`Speed: ${(1 + (level - 1) * 0.3).toFixed(1)}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2 + 50);
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (levelComplete) {
        ctx.fillStyle = '#0f0';
        ctx.font = '48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL COMPLETE!', canvas.width / 2, canvas.height / 2 - 25);
        ctx.font = '24px Courier New';
        ctx.fillText('Press SPACE for Next Level', canvas.width / 2, canvas.height / 2 + 25);
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (gameOver) {
        ctx.fillStyle = '#f00';
        ctx.font = '48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 25);
        ctx.font = '24px Courier New';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 25);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 55);
        ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 85);
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Update
    updatePlayer();
    updateBullets();
    updateEnemies();
    checkCollisions();
    
    // Draw
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawUI();
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (e.code === 'Space') {
        e.preventDefault();
        
        if (showLevelScreen) {
            showLevelScreen = false;
            createEnemies();
        } else if (levelComplete) {
            level++;
            levelComplete = false;
            showLevelScreen = true;
            bullets = [];
            enemyBullets = [];
            if (document.getElementById('level')) {
                document.getElementById('level').textContent = level;
            }
        } else if (!gameOver && !levelComplete && !paused) {
            bullets.push({
                x: player.x + player.width / 2,
                y: player.y
            });
            sounds.shoot();
        }
    }
    
    if (e.code === 'KeyP' && !gameOver && !showLevelScreen && !levelComplete) {
        paused = !paused;
    }
    
    if (e.code === 'KeyQ' && !gameOver) {
        if (paused || showLevelScreen || levelComplete) {
            quit = true;
            paused = false;
        }
    }
    
    if (e.code === 'KeyR' && (gameOver || quit)) {
        // Restart game - reset ALL variables first
        score = 0;
        lives = 3;
        level = 1;
        enemySpeed = 1;
        enemyDirection = 1;
        gameOver = false;
        levelComplete = false;
        showLevelScreen = true;
        paused = false;
        quit = false;
        bullets = [];
        enemyBullets = [];
        enemies = [];
        player.x = canvas.width / 2 - 25;
        if (document.getElementById('score')) {
            document.getElementById('score').textContent = score;
        }
        if (document.getElementById('lives')) {
            document.getElementById('lives').textContent = lives;
        }
        if (document.getElementById('level')) {
            document.getElementById('level').textContent = level;
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Initialize high score display
if (document.getElementById('highScore')) {
    document.getElementById('highScore').textContent = highScore;
}

// Start game
gameLoop();
