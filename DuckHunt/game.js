class GameObject {
    constructor(x, y, element) {
        this.x = x
        this.y = y
        this.element = element
        this.positionAt(this.x, this.y)
    }

    rect() {
        return {
            x: this.x,
            y: this.y,
            width: spriteSize,
            height: spriteSize
        }
    }

    positionAt(x, y) {
        this.x = x
        this.y = y
        this.element.style.left = Math.floor(this.x) + 'px'
        this.element.style.top = Math.floor(this.y) + 'px'
    }

    move(dx, dy) {
        this.previousX = this.x
        this.previousY = this.y
        this.x += dx
        this.y += dy
        this.positionAt(this.x, this.y)
    }

    revertToPreviousPosition() {
        this.positionAt(this.previousX, this.previousY)
    }
}

class Aim extends GameObject {
    constructor(x, y, element, aimSpeed) {
        super(x, y, element);
        this.aimSpeed = aimSpeed
        this.score = 0
    }

    moveInDirection(distance, direction) {
        if (direction === 'up') {
            this.move(0, -distance)
        }

        if (direction === 'down') {
            this.move(0, distance)
        }

        if (direction === 'left') {
            this.move(-distance, 0)
        }

        if (direction === 'right') {
            this.move(distance, 0)
        }
    }

    increaseScore() {
        this.score += 500
        document.getElementById('scoreId').innerText = this.score
    }
}

class Duck extends GameObject {
    constructor(x, y, element, duckSpeed) {
        super(x, y, element);
        this.duckSpeed = duckSpeed
        this.direction = randomBetween(0, 359)
    }

    changeDirection() {
        // new direction
        this.direction = randomBetween(0, 359)
    }
}  

function initializeGame() {
    spawnAim()
    spawnDuck()
    roundBox()
}

function spawnDuck() {
    const x = randomBetween(0, gameWidth - duckSpriteSize)
    const y = randomBetween(300, 400  - duckSpriteSize)
    //create a div
    const element = document.createElement('div');
    element.classList.add('duck')
    // add div to gameArea
    gameAreaElement.appendChild(element);
    const duck = new Duck(x, y, element)
    ducks.push(duck)
    console.log(duck)

    setTimeout(() => {
        if (ducks.includes(duck)) { // Check if the duck is still in the game
            gameOver = true;
        }
    }, 5000);
}

function spawnAim() {
    const element = document.getElementById('aim')
    const x = (gameWidth - (spriteSize/2)) - (gameWidth/2)
    const y = gameHeight - (gameHeight/2)
    aim = new Aim(x, y, element, aimSpeed)
    console.log(aim)
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min
}

function onKeyDown(event) {
    pressedKeys[event.key] = true
}

function onKeyUp(event) {
    pressedKeys[event.key] = false;
    if (event.key === 'h') {
        shotPressed = false; // Reset the flag when the key is released
    }
}

function moveAim() {
    if (pressedKeys.w || pressedKeys.ArrowUp) {
        aim.moveInDirection(aimSpeed, 'up')
    }
    else if (pressedKeys.a || pressedKeys.ArrowLeft) {
        aim.moveInDirection(aimSpeed, 'left')
    }
    else if (pressedKeys.s || pressedKeys.ArrowDown) {
        aim.moveInDirection(aimSpeed, 'down')
    }
    else if (pressedKeys.d || pressedKeys.ArrowRight) {
        aim.moveInDirection(aimSpeed, 'right')
    }
}

function moveDuck(duck) {
    const dx = Math.sin(duck.direction) * duckSpeed
    const dy = Math.cos(duck.direction) * duckSpeed
    duck.move(dx, dy)
}

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
                roundNumber++; 
                console.log("round", roundNumber);
                duckShotCounter = 0;
                duckSpeed += 0.5;
                roundBox()
            }
            setTimeout(spawnDuck, 3000);
        }
        decreaseBullets()
    }
}

function isInside(innerRect, outerRect) {
    return innerRect.x >= outerRect.x &&
        innerRect.x + innerRect.width <= outerRect.x + outerRect.width &&
        innerRect.y >= outerRect.y &&
        innerRect.y + innerRect.height <= outerRect.y + outerRect.height
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
}

function checkCollisions() {
    if (!isInside(aim.rect(), gameAreaRect)) {
        aim.revertToPreviousPosition()
    }

    for (const duck of ducks) {
        if (isColliding(aim.rect(), duck.rect())) {
            collidedDuck = duck;
            console.log("SHOOT THE DUCK!")
        }

        if (!isInside(duck.rect(), gameAreaRect)) {
            duck.revertToPreviousPosition()
            duck.changeDirection()
        }
    } 
}

function decreaseBullets() {
    document.getElementById('bulletId').innerText = 3 - shotCount;
}

function gameOverScreen() {
    document.getElementById('gameOverScreen').style.display = 'block';
}

function roundBox() {
    document.getElementById('roundNumberId').innerText = roundNumber;
    const newRoundBoxElement = document.getElementById('newRoundBox');
    newRoundBoxElement.style.display = 'block';
    setTimeout(() => {
        newRoundBoxElement.style.display = 'none';
    }, 1500);
}

function tryAgain() {
    location.reload()
}

function gameLoop() {
    if (gameOver) {
        gameOverScreen()
    } else {
        moveAim()
        ducks.forEach(duck => {
            moveDuck(duck)
        })
        checkCollisions()
        shot() 
        window.requestAnimationFrame(gameLoop)
    }
}

// game constants/variables
const gameWidth = 800
const gameHeight = 400
const spriteSize = 60
const duckSpriteSize = 70
const aimSpeed = 6
let duckSpeed = 4
let shotCount = 0;
let duckShotCounter = 0;
let roundNumber = 1;
const gameAreaElement = document.getElementById('gameArea')
const gameAreaRect = { x: 0, y: 0, width: gameWidth, height: gameHeight}

// collisions and game properties
const pressedKeys = { w: false, a: false, s: false, d: false, h: false}
let gameOver = false
let collidedDuck = null
let shotPressed = false;

// game objects
const ducks = []
let aim

//event listeners and element ids
document.addEventListener('keydown', onKeyDown)
document.addEventListener('keyup', onKeyUp)

document.getElementById('startBtn').addEventListener('click', () => {
    initializeGame()
    window.requestAnimationFrame(gameLoop)
    const startScreen = document.getElementById('startScreen');
    startScreen.style.display = 'none';
})


