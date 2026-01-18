// Flabby Bird - The Chonky Edition
// A heavier, fatter twist on the classic!

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let highScore = localStorage.getItem('flabbyBirdHighScore') || 0;

// Chonky Bird properties - THIS BIRD IS THICC
const bird = {
    x: 80,
    y: 300,
    width: 55,      // Extra wide for the chonk
    height: 45,     // Tall and round
    velocity: 0,
    gravity: 0.6,   // HEAVY bird falls faster!
    jumpStrength: -9, // Less lift because so heavy
    rotation: 0,
    wobble: 0,      // Wobble animation
    wobbleSpeed: 0,
    flapFrame: 0,   // Animation frame for flapping

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

    update() {
        // Apply heavy gravity
        this.velocity += this.gravity;

        // Terminal velocity - even chonky birds have limits
        if (this.velocity > 15) this.velocity = 15;

        this.y += this.velocity;

        // Wobble effect - the chonk jiggles!
        this.wobble += this.wobbleSpeed;
        this.wobbleSpeed *= 0.95; // Dampen wobble

        // Rotation based on velocity (tilts more dramatically because heavy)
        this.rotation = Math.min(Math.max(this.velocity * 4, -30), 90);

        // Decrease flap frame
        if (this.flapFrame > 0) this.flapFrame--;

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

        // Wobble scale effect
        const wobbleScale = 1 + Math.sin(this.wobble) * 0.05;
        ctx.scale(wobbleScale, 1 / wobbleScale);

        // Draw the CHONKY bird
        const w = this.width;
        const h = this.height;

        // Body - big round orange blob
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body outline
        ctx.strokeStyle = '#CC4411';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Belly - lighter orange for that chonky tummy
        ctx.fillStyle = '#FFB088';
        ctx.beginPath();
        ctx.ellipse(5, 5, w / 3, h / 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wing - flaps when jumping
        ctx.fillStyle = '#CC4411';
        const wingY = this.flapFrame > 0 ? -12 : 0;
        ctx.beginPath();
        ctx.ellipse(-8, wingY, 12, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Eye white
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(12, -8, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye pupil - looks determined
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.ellipse(15, -7, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(17, -9, 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyebrow - determined/struggling expression
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(5, -18);
        ctx.lineTo(20, -15);
        ctx.stroke();

        // Beak - small compared to body lol
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(25, -2);
        ctx.lineTo(35, 2);
        ctx.lineTo(25, 6);
        ctx.closePath();
        ctx.fill();

        // Beak line
        ctx.strokeStyle = '#CC8800';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(25, 2);
        ctx.lineTo(33, 2);
        ctx.stroke();

        // Blush marks - the bird is working hard!
        ctx.fillStyle = 'rgba(255, 100, 100, 0.4)';
        ctx.beginPath();
        ctx.ellipse(18, 5, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sweat drops when falling fast
        if (this.velocity > 5) {
            ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
            ctx.beginPath();
            ctx.ellipse(-20, -15, 3, 5, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-15, -20, 2, 4, 0.3, 0, Math.PI * 2);
            ctx.fill();
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

function updatePipes() {
    pipeSpawnTimer++;
    if (pipeSpawnTimer >= pipeSpawnInterval) {
        spawnPipe();
        pipeSpawnTimer = 0;
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;

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

function drawBackground() {
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
        cloud.x -= cloud.speed;
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

function drawGround() {
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

    groundOffset = (groundOffset + pipeSpeed) % 40;
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

function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground();

    if (gameState === 'playing') {
        // Update bird
        const hitGround = bird.update();

        // Update pipes
        updatePipes();

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
    drawGround();

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
    startGame();
});

// Initialize high score display
document.getElementById('highScore').textContent = highScore;

// Start the game loop
gameLoop();
