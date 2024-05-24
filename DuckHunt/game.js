class GameObject {
    // Constructor to initialize the game object with its position and HTML element
    constructor(x, y, element) {
        this.x = x;
        this.y = y;
        this.element = element;
        this.positionAt(this.x, this.y);
    }

    // Method to get the rectangle representing the object's position and size
    rect() {
        return {
            x: this.x,
            y: this.y,
            width: spriteSize,
            height: spriteSize
        };
    }

    // Method to set the object's position and update its CSS properties
    positionAt(x, y) {
        this.x = x;
        this.y = y;
        this.element.style.left = Math.floor(this.x) + 'px';
        this.element.style.top = Math.floor(this.y) + 'px';
    }

    // Method to move the object by a certain amount
    move(dx, dy) {
        this.previousX = this.x;
        this.previousY = this.y;
        this.x += dx;
        this.y += dy;
        this.positionAt(this.x, this.y);
    }

    // Method to revert the object to its previous position
    revertToPreviousPosition() {
        this.positionAt(this.previousX, this.previousY);
    }
}

class Aim extends GameObject {
    // Constructor to initialize the aim object with its speed and score
    constructor(x, y, element, aimSpeed) {
        super(x, y, element);
        this.aimSpeed = aimSpeed;
        this.score = 0;
    }

    // Method to move the aim in a specific direction
    moveInDirection(distance, direction) {
        if (direction === 'up') {
            this.move(0, -distance);
        }
        if (direction === 'down') {
            this.move(0, distance);
        }
        if (direction === 'left') {
            this.move(-distance, 0);
        }
        if (direction === 'right') {
            this.move(distance, 0);
        }
    }

    // Method to increase the score when a duck is hit
    increaseScore() {
        this.score += 500;
        document.getElementById('scoreId').innerText = this.score;
    }
}

class Duck extends GameObject {
    // Constructor to initialize the duck object with its speed and random direction
    constructor(x, y, element, duckSpeed) {
        super(x, y, element);
        this.duckSpeed = duckSpeed;
        this.direction = randomBetween(0, 359);
    }

    // Method to change the duck's direction to a new random value
    changeDirection() {
        this.direction = randomBetween(0, 359);
    }
}  

// Function to initialize the game by spawning the aim and duck objects and starting the round
function initializeGame() {
    spawnAim();
    spawnDuck();
    roundBox();
}

// Function to spawn a new duck at a random position
function spawnDuck() {
    const x = randomBetween(0, gameWidth - duckSpriteSize);
    const y = randomBetween(300, 400 - duckSpriteSize);
    const element = document.createElement('div');
    element.classList.add('duck');
    gameAreaElement.appendChild(element);
    const duck = new Duck(x, y, element, duckSpeed);
    ducks.push(duck);
    console.log(duck);

    setTimeout(() => {
        if (ducks.includes(duck)) { 
            gameOver = true;
        }
    }, 5000);
}

// Function to spawn the aim at the center of the game area
function spawnAim() {
    const element = document.getElementById('aim');
    const x = (gameWidth - (spriteSize / 2)) - (gameWidth / 2);
    const y = gameHeight - (gameHeight / 2);
    aim = new Aim(x, y, element, aimSpeed);
    console.log(aim);
}

// Function to get a random value between min and max
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

// Event listener for key down events
function onKeyDown(event) {
    pressedKeys[event.key] = true;
}

// Event listener for key up events
function onKeyUp(event) {
    pressedKeys[event.key] = false;
    if (event.key === 'h') {
        shotPressed = false;
    }
}

// Function to move the aim based on pressed keys
function moveAim() {
    if (pressedKeys.w || pressedKeys.ArrowUp) {
        aim.moveInDirection(aimSpeed, 'up');
    }
    if (pressedKeys.a || pressedKeys.ArrowLeft) {
        aim.moveInDirection(aimSpeed, 'left');
    }
    if (pressedKeys.s || pressedKeys.ArrowDown) {
        aim.moveInDirection(aimSpeed, 'down');
    }
    if (pressedKeys.d || pressedKeys.ArrowRight) {
        aim.moveInDirection(aimSpeed, 'right');
    }
}

// Function to move a duck based on its direction and speed
function moveDuck(duck) {
    const dx = Math.sin(duck.direction) * duckSpeed;
    const dy = Math.cos(duck.direction) * duckSpeed;
    duck.move(dx, dy);
}

// Function to handle shooting actions
function shot() {
    if (shotCount >= 3) {
        gameOver = true
    }

    const aimElement = document.getElementById('aim');
    aimElement.style.backgroundColor = pressedKeys.h ? 'white' : '';

    if (pressedKeys.h && !shotPressed) {
        shotPressed = true; 
        shotCount++;

        if (collidedDuck) {
            collidedDuck.element.remove();
            ducks.splice(ducks.indexOf(collidedDuck), 1);
            collidedDuck = null;
            aim.increaseScore();
            shotCount = 0;
            duckShotCounter++;
            if ((duckShotCounter === 10)) {
                newRoundChanges()
            }
            setTimeout(spawnDuck, 3000);
        }
        decreaseBullets()
    }
}

// Function to handle changes for a new round
function newRoundChanges() {
    roundNumber++; 
    console.log("round", roundNumber);
    duckShotCounter = 0;
    duckSpeed += 0.5;
    roundBox();
}

// Function to check if a rectangle is inside another rectangle
function isInside(innerRect, outerRect) {
    return innerRect.x >= outerRect.x &&
        innerRect.x + innerRect.width <= outerRect.x + outerRect.width &&
        innerRect.y >= outerRect.y &&
        innerRect.y + innerRect.height <= outerRect.y + outerRect.height;
}

// Function to check if two rectangles are colliding
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

// Function to check for collisions between the aim and ducks, and to keep objects inside the game area
function checkCollisions() {
    if (!isInside(aim.rect(), gameAreaRect)) {
        aim.revertToPreviousPosition();
    }

    for (const duck of ducks) {
        if (isColliding(aim.rect(), duck.rect())) {
            collidedDuck = duck;
            console.log("SHOOT THE DUCK!");
        }

        if (!isInside(duck.rect(), gameAreaRect)) {
            duck.revertToPreviousPosition();
            duck.changeDirection();
        }
    } 
}

// Function to update the bullet count on the screen
function decreaseBullets() {
    document.getElementById('bulletId').innerText = 3 - shotCount;
}

// Function to display the game over screen
function gameOverScreen() {
    document.getElementById('gameOverScreen').style.display = 'block';
}

// Function to display the round number and start a new round
function roundBox() {
    document.getElementById('roundNumberId').innerText = roundNumber;
    const newRoundBoxElement = document.getElementById('newRoundBox');
    newRoundBoxElement.style.display = 'block';
    setTimeout(() => {
        newRoundBoxElement.style.display = 'none';
    }, 1500);
}

// Function to reload the page and try again
function tryAgain() {
    location.reload();
}

// Main game loop function
function gameLoop() {
    if (gameOver) {
        gameOverScreen();
    } else {
        moveAim();
        ducks.forEach(duck => {
            moveDuck(duck);
        });
        checkCollisions();
        shot();
        window.requestAnimationFrame(gameLoop);
    }
}

// Game constants and variables
const gameWidth = 800;
const gameHeight = 400;
const spriteSize = 60;
const duckSpriteSize = 70;
const aimSpeed = 6;
let duckSpeed = 4;
let shotCount = 0;
let duckShotCounter = 0;
let roundNumber = 1;
const gameAreaElement = document.getElementById('gameArea');
const gameAreaRect = { x: 0, y: 0, width: gameWidth, height: gameHeight };

// Game state variables
const pressedKeys = { w: false, a: false, s: false, d: false, h: false };
let gameOver = false;
let collidedDuck = null;
let shotPressed = false;

// Game objects
const ducks = [];
let aim;

// Event listeners for keyboard input
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// Event listener for start button
document.getElementById('startBtn').addEventListener('click', () => {
    initializeGame();
    window.requestAnimationFrame(gameLoop);
    const startScreen = document.getElementById('startScreen');
    startScreen.style.display = 'none';
});
