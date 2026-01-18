// Flabby Chonk - The Chonky Edition
// A heavier, fatter twist on the classic!

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let highScore = localStorage.getItem('flabbyBirdHighScore') || 0;

// Delta time for consistent speed across browsers
let lastTime = performance.now();
const TARGET_FPS = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_FPS; // ~16.67ms per frame

// Chonkiness level (0-100) - affects size AND weight
let chonkiness = 50; // Default middle value

// Speed multiplier (0.5 to 2.0) - controlled by slider
let gameSpeed = 1.0;

// Base physics (normal, not heavy)
const BASE_GRAVITY = 0.35;
const BASE_JUMP = -7.5;
const BASE_WIDTH = 45;
const BASE_HEIGHT = 38;

// Chonky Bird properties - THIS BIRD IS THICC
const bird = {
    x: 80,
    y: 300,
    baseWidth: BASE_WIDTH,
    baseHeight: BASE_HEIGHT,
    velocity: 0,
    baseGravity: BASE_GRAVITY,
    baseJump: BASE_JUMP,
    rotation: 0,
    wobble: 0,      // Wobble animation
    wobbleSpeed: 0,
    flapFrame: 0,   // Animation frame for flapping

    // Dynamic properties based on chonkiness
    get width() {
        // Scale from 1x to 2.2x based on chonkiness
        const scale = 1 + (chonkiness / 100) * 1.2;
        return this.baseWidth * scale;
    },
    get height() {
        // Scale from 1x to 2x based on chonkiness
        const scale = 1 + (chonkiness / 100) * 1.0;
        return this.baseHeight * scale;
    },
    get gravity() {
        // Gravity scales from 0.35 to 0.7 based on chonkiness
        return this.baseGravity + (chonkiness / 100) * 0.35;
    },
    get jumpStrength() {
        // Jump scales from -7.5 to -10 (stronger jump needed for heavier bird)
        return this.baseJump - (chonkiness / 100) * 2.5;
    },

    reset() {
        this.y = 300;
        this.velocity = 0;
        this.rotation = 0;
        this.wobble = 0;
        this.wobbleSpeed = 0;
        this.flapFrame = 0;
    },

    flap() {
        this.velocity = this.jumpStrength;
        this.wobbleSpeed = 0.5; // Start wobbling when flap
        this.flapFrame = 10;    // Flap animation frames
    },

    update(dt) {
        // dt is the delta time multiplier (1.0 = normal frame)
        const timeScale = dt * gameSpeed;

        // Apply heavy gravity (scaled by delta time)
        this.velocity += this.gravity * timeScale;

        // Terminal velocity - even chonky birds have limits
        if (this.velocity > 15) this.velocity = 15;

        this.y += this.velocity * timeScale;

        // Wobble effect - the chonk jiggles!
        this.wobble += this.wobbleSpeed * timeScale;
        this.wobbleSpeed *= Math.pow(0.95, timeScale); // Dampen wobble

        // Rotation based on velocity (tilts more dramatically because heavy)
        this.rotation = Math.min(Math.max(this.velocity * 4, -30), 90);

        // Decrease flap frame
        if (this.flapFrame > 0) this.flapFrame -= timeScale;

        // Boundaries
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
        if (this.y + this.height > canvas.height - groundHeight) {
            this.y = canvas.height - groundHeight - this.height;
            return true; // Hit ground
        }
        return false;
    },

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate((this.rotation * Math.PI) / 180);

        // Wobble scale effect - more wobble when chonkier
        const wobbleIntensity = 0.03 + (chonkiness / 100) * 0.07;
        const wobbleScale = 1 + Math.sin(this.wobble) * wobbleIntensity;
        ctx.scale(wobbleScale, 1 / wobbleScale);

        // Draw the SUPER CHONKY bird
        const w = this.width;
        const h = this.height;
        const fatness = 1 + (chonkiness / 100) * 0.3; // Extra visual fatness multiplier

        // Body - SUPER FAT round orange blob
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.ellipse(0, 0, (w / 2) * fatness, (h / 2) * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body outline - thicker when fatter
        ctx.strokeStyle = '#CC4411';
        ctx.lineWidth = 3 + (chonkiness / 50);
        ctx.stroke();

        // Fat rolls when very chonky
        if (chonkiness > 40) {
            ctx.strokeStyle = 'rgba(204, 68, 17, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, h * 0.15, (w / 2.5) * fatness, h / 8, 0, 0.2, Math.PI - 0.2);
            ctx.stroke();
        }
        if (chonkiness > 70) {
            ctx.beginPath();
            ctx.ellipse(0, h * 0.25, (w / 3) * fatness, h / 10, 0, 0.3, Math.PI - 0.3);
            ctx.stroke();
        }

        // Belly - EXTRA THICC lighter orange tummy
        ctx.fillStyle = '#FFB088';
        ctx.beginPath();
        ctx.ellipse(5, 8, (w / 2.5) * fatness, (h / 2.8), 0, 0, Math.PI * 2);
        ctx.fill();

        // Wing - small compared to massive body, flaps when jumping
        ctx.fillStyle = '#CC4411';
        const wingY = this.flapFrame > 0 ? -12 : 0;
        const wingScale = 0.8 + (chonkiness / 100) * 0.4;
        ctx.beginPath();
        ctx.ellipse(-w * 0.2, wingY, 12 * wingScale, 8 * wingScale, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Second wing layer for depth
        ctx.fillStyle = '#B33A0D';
        ctx.beginPath();
        ctx.ellipse(-w * 0.25, wingY + 2, 8 * wingScale, 5 * wingScale, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Eye white - tiny compared to body
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(w * 0.25, -h * 0.2, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye pupil - looks stressed from being so fat
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.ellipse(w * 0.28, -h * 0.18, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(w * 0.3, -h * 0.22, 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyebrow - more stressed when chonkier
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const browAngle = chonkiness / 100 * 5;
        ctx.moveTo(w * 0.1, -h * 0.4 - browAngle);
        ctx.lineTo(w * 0.4, -h * 0.35);
        ctx.stroke();

        // Beak - tiny compared to massive body
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(w * 0.45, -2);
        ctx.lineTo(w * 0.55, 2);
        ctx.lineTo(w * 0.45, 6);
        ctx.closePath();
        ctx.fill();

        // Beak line
        ctx.strokeStyle = '#CC8800';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w * 0.45, 2);
        ctx.lineTo(w * 0.52, 2);
        ctx.stroke();

        // Double chin when very chonky
        if (chonkiness > 50) {
            ctx.fillStyle = '#FF8855';
            ctx.beginPath();
            ctx.ellipse(w * 0.15, h * 0.35, w * 0.2, h * 0.15, 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Blush marks - the bird is working EXTRA hard!
        ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
        ctx.beginPath();
        ctx.ellipse(w * 0.35, h * 0.05, 6 + chonkiness / 20, 4 + chonkiness / 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // Extra blush on other cheek when very fat
        if (chonkiness > 60) {
            ctx.beginPath();
            ctx.ellipse(-w * 0.1, h * 0.1, 5, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sweat drops when falling fast - more when heavier
        if (this.velocity > 4) {
            ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
            ctx.beginPath();
            ctx.ellipse(-w * 0.4, -h * 0.35, 3, 5, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-w * 0.3, -h * 0.45, 2, 4, 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Extra sweat when very chonky
            if (chonkiness > 50) {
                ctx.beginPath();
                ctx.ellipse(-w * 0.5, -h * 0.2, 2, 3, 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
};

// Pipe properties - wider gaps for chonky bird
const pipes = [];
const pipeWidth = 70;
const pipeGap = 180;  // Generous gap for the thicc bird
const pipeSpeed = 3;
let pipeSpawnTimer = 0;
const pipeSpawnInterval = 100;

// Ground
const groundHeight = 80;
let groundOffset = 0;

// Clouds for background
const clouds = [];
for (let i = 0; i < 5; i++) {
    clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * 200 + 50,
        size: Math.random() * 40 + 30,
        speed: Math.random() * 0.5 + 0.2
    });
}

function spawnPipe() {
    const minHeight = 80;
    const maxHeight = canvas.height - groundHeight - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        passed: false
    });
}

function updatePipes(dt) {
    const timeScale = dt * gameSpeed;

    pipeSpawnTimer += timeScale;
    if (pipeSpawnTimer >= pipeSpawnInterval) {
        spawnPipe();
        pipeSpawnTimer = 0;
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed * timeScale;

        // Score when passing pipe
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].passed = true;
            score++;
            updateScoreDisplay();
        }

        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Pipe gradient
        const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        gradient.addColorStop(0, '#2ECC71');
        gradient.addColorStop(0.5, '#27AE60');
        gradient.addColorStop(1, '#1E8449');

        // Top pipe
        ctx.fillStyle = gradient;
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

        // Top pipe cap
        ctx.fillStyle = '#27AE60';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, pipeWidth + 10, 30);
        ctx.strokeStyle = '#1E8449';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x - 5, pipe.topHeight - 30, pipeWidth + 10, 30);

        // Bottom pipe
        const bottomY = pipe.topHeight + pipeGap;
        ctx.fillStyle = gradient;
        ctx.fillRect(pipe.x, bottomY, pipeWidth, canvas.height - bottomY - groundHeight);

        // Bottom pipe cap
        ctx.fillStyle = '#27AE60';
        ctx.fillRect(pipe.x - 5, bottomY, pipeWidth + 10, 30);
        ctx.strokeStyle = '#1E8449';
        ctx.strokeRect(pipe.x - 5, bottomY, pipeWidth + 10, 30);

        // Pipe shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(pipe.x + 5, 0, 10, pipe.topHeight - 30);
        ctx.fillRect(pipe.x + 5, bottomY + 30, 10, canvas.height - bottomY - groundHeight - 30);
    });
}

function checkCollision() {
    for (const pipe of pipes) {
        // Check collision with top pipe
        if (bird.x + bird.width * 0.7 > pipe.x &&
            bird.x + bird.width * 0.3 < pipe.x + pipeWidth &&
            bird.y + bird.height * 0.2 < pipe.topHeight) {
            return true;
        }

        // Check collision with bottom pipe
        const bottomY = pipe.topHeight + pipeGap;
        if (bird.x + bird.width * 0.7 > pipe.x &&
            bird.x + bird.width * 0.3 < pipe.x + pipeWidth &&
            bird.y + bird.height * 0.8 > bottomY) {
            return true;
        }
    }
    return false;
}

function drawBackground(dt) {
    const timeScale = dt * gameSpeed;

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(0.7, '#B0E0E6');
    skyGradient.addColorStop(1, '#98D8C8');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    clouds.forEach(cloud => {
        drawCloud(cloud.x, cloud.y, cloud.size);
        cloud.x -= cloud.speed * timeScale;
        if (cloud.x + cloud.size * 2 < 0) {
            cloud.x = canvas.width + cloud.size;
        }
    });
}

function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y + size * 0.1, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
}

function drawGround(dt) {
    const timeScale = dt * gameSpeed;

    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

    // Grass on top
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, 20);

    // Grass detail
    ctx.fillStyle = '#32CD32';
    for (let i = 0; i < canvas.width; i += 20) {
        const offset = (i + groundOffset) % 40;
        ctx.beginPath();
        ctx.moveTo(i, canvas.height - groundHeight + 20);
        ctx.lineTo(i + 10, canvas.height - groundHeight + 5);
        ctx.lineTo(i + 20, canvas.height - groundHeight + 20);
        ctx.fill();
    }

    // Dirt texture
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < 10; i++) {
        const x = ((i * 47 + groundOffset) % canvas.width);
        const y = canvas.height - groundHeight + 30 + (i % 3) * 15;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    groundOffset = (groundOffset + pipeSpeed * timeScale) % 40;
}

function drawScore() {
    if (gameState === 'playing') {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText(score, canvas.width / 2, 60);
        ctx.fillText(score, canvas.width / 2, 60);
    }
}

function updateScoreDisplay() {
    document.getElementById('currentScore').textContent = score;
}

function gameOver() {
    gameState = 'gameOver';

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flabbyBirdHighScore', highScore);
    }

    document.getElementById('finalScore').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function startGame() {
    gameState = 'playing';
    score = 0;
    updateScoreDisplay();
    pipes.length = 0;
    pipeSpawnTimer = 0;
    bird.reset();
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
}

function gameLoop(currentTime) {
    // Calculate delta time
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Delta time multiplier (1.0 = target frame time of ~16.67ms)
    const dt = deltaTime / TARGET_FRAME_TIME;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground(dt);

    if (gameState === 'playing') {
        // Update bird
        const hitGround = bird.update(dt);

        // Update pipes
        updatePipes(dt);

        // Check collisions
        if (hitGround || checkCollision()) {
            gameOver();
        }
    } else if (gameState === 'start') {
        // Idle animation for bird on start screen
        bird.y = 300 + Math.sin(Date.now() / 300) * 20;
    }

    // Draw pipes (behind bird)
    drawPipes();

    // Draw ground
    drawGround(dt);

    // Draw bird
    bird.draw();

    // Draw score
    drawScore();

    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing') {
            bird.flap();
        } else if (gameState === 'start') {
            startGame();
            bird.flap();
        } else if (gameState === 'gameOver') {
            startGame();
        }
    }
});

canvas.addEventListener('click', () => {
    if (gameState === 'playing') {
        bird.flap();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'playing') {
        bird.flap();
    }
});

document.getElementById('startBtn').addEventListener('click', () => {
    startGame();
    bird.flap();
});

document.getElementById('restartBtn').addEventListener('click', () => {
    // Go back to start screen instead of immediately restarting
    goToStartScreen();
});

function goToStartScreen() {
    gameState = 'start';
    score = 0;
    updateScoreDisplay();
    pipes.length = 0;
    pipeSpawnTimer = 0;
    bird.reset();
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}

// Initialize high score display
document.getElementById('highScore').textContent = highScore;

// Chonky slider handler
const chonkySlider = document.getElementById('chonkySlider');

if (chonkySlider) {
    chonkySlider.addEventListener('input', (e) => {
        chonkiness = parseInt(e.target.value);
        updateChonkyLabel();
    });
}

function updateChonkyLabel() {
    const label = document.getElementById('chonkyLabel');
    if (!label) return;

    if (chonkiness < 20) {
        label.textContent = 'Slim Bird';
    } else if (chonkiness < 40) {
        label.textContent = 'Normal Bird';
    } else if (chonkiness < 60) {
        label.textContent = 'Chubby Bird';
    } else if (chonkiness < 80) {
        label.textContent = 'THICC Bird';
    } else {
        label.textContent = 'MEGA CHONKER';
    }
}

// Speed slider handler
const speedSlider = document.getElementById('speedSlider');

if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
        gameSpeed = parseFloat(e.target.value) / 100; // Convert 50-200 to 0.5-2.0
        updateSpeedLabel();
    });
}

function updateSpeedLabel() {
    const label = document.getElementById('speedLabel');
    if (!label) return;

    const speedPercent = Math.round(gameSpeed * 100);
    if (gameSpeed < 0.7) {
        label.textContent = `Chill Mode (${speedPercent}%)`;
    } else if (gameSpeed < 0.9) {
        label.textContent = `Slow (${speedPercent}%)`;
    } else if (gameSpeed < 1.1) {
        label.textContent = `Normal (${speedPercent}%)`;
    } else if (gameSpeed < 1.5) {
        label.textContent = `Fast (${speedPercent}%)`;
    } else {
        label.textContent = `INSANE (${speedPercent}%)`;
    }
}

// Initialize labels
updateChonkyLabel();
updateSpeedLabel();

// Start the game loop
lastTime = performance.now();
requestAnimationFrame(gameLoop);
