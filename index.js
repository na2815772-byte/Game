const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
class Particle {
    constructor(x, y, color, speedX, speedY, size) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.speedX = speedX;
        this.speedY = speedY;
        this.size = size;
        this.opacity = 1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.01;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(Math.random() < 0.2) {
        particles.push(new Particle(Math.random() * canvas.width/2, canvas.height, '#00d9ff', Math.random()*4 - 2, -Math.random()*4 - 1, Math.random()*5 + 2));
        particles.push(new Particle(canvas.width/2 + Math.random() * canvas.width/2, canvas.height, '#ff4400', Math.random()*4 - 2, -Math.random()*4 - 1, Math.random()*5 + 2));
    }
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if(particle.opacity <= 0) particles.splice(index, 1);
    });
    requestAnimationFrame(animate);
}
animate();

// Paddle properties
const paddleWidth = 12;
const paddleHeight = 100;

// Players
const icePlayer = {
    x: 50,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#00d9ff",
    score: 0,
    dy: 0
};

const firePlayer = {
    x: canvas.width - 20 - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#ff4400",
    score: 0,
    dy: 0
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 9,
    speed: 7,
    dx: 5,
    dy: 5,
    color: "#ffffff"
};

// Draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.setLineDash([10, 10]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "40px Arial";
    ctx.fillText(text, x, y);
}

// Controls
document.addEventListener("keydown", (e) => {
    // Ice Player (W / S)
    if (e.key === "w" || e.key === "W") icePlayer.dy = -8;
    if (e.key === "s" || e.key === "S") icePlayer.dy = 8;
    
    // Fire Player (ArrowUp / ArrowDown)
    if (e.key === "ArrowUp") firePlayer.dy = -8;
    if (e.key === "ArrowDown") firePlayer.dy = 8;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "W" || e.key === "s" || e.key === "S") icePlayer.dy = 0;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") firePlayer.dy = 0;
});

// Collision detection
function collision(b, p) {
    return b.x - b.radius < p.x + p.width &&
           b.x + b.radius > p.x &&
           b.y + b.radius > p.y &&
           b.y - b.radius < p.y + p.height;
}

// Reset Ball
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 7;
    ball.dx = -ball.dx;
    ball.dy = 5 * (Math.random() > 0.5 ? 1 : -1);
}

// Update Game Logic
function update() {
    // Move paddles
    icePlayer.y += icePlayer.dy;
    firePlayer.y += firePlayer.dy;

    // Constrain paddles inside canvas
    icePlayer.y = Math.max(0, Math.min(canvas.height - icePlayer.height, icePlayer.y));
    firePlayer.y = Math.max(0, Math.min(canvas.height - firePlayer.height, firePlayer.y));

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (Top & Bottom)
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Determine active paddle for collision check
    let player = (ball.x < canvas.width / 2) ? icePlayer : firePlayer;

    if (collision(ball, player)) {
        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        
        ball.dx = direction * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
        ball.speed += 0.2;
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        firePlayer.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        icePlayer.score++;
        resetBall();
    }
}

// Render function
function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, "#05070a");
    
    // Draw Net
    drawNet();

    // Draw Scores
    drawText(icePlayer.score, canvas.width / 4, 60, icePlayer.color);
    drawText(firePlayer.score, (3 * canvas.width) / 4, 60, firePlayer.color);

    // Draw Paddles
    drawRect(icePlayer.x, icePlayer.y, icePlayer.width, icePlayer.height, icePlayer.color);
    drawRect(firePlayer.x, firePlayer.y, firePlayer.width, firePlayer.height, firePlayer.color);

    // Draw Ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Main Game Loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
