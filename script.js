// Space Invadres

let BSX = 32;
let BSY = 32;
let ROWS = 14;
let COLUMNS = 10;
let NumOfStars = 90;

let screen;
let screenWidth = BSX * COLUMNS;
let screenHeight = BSY * ROWS;

let context;

let shipWidth = BSX;
let shipHeight = BSY + BSY / 2;
let shipX = screenWidth / 2 - shipWidth / 2;
let shipY = screenHeight - shipHeight;
let shipDisplacementX = BSX / 4;
let shipDirection = 0;

let ship = {
  x: shipX,
  y: shipY,
  width: shipWidth,
  height: shipHeight,
  direction: shipDirection
}

let shipImg;

let aliensArray = [];
let aliensWidth = BSX;
let aliensHeight = BSY;
let aliensMarginX =1;
let aliensMarginY =1;

let aliensImg;
let aliensRows = 2;
let aliensColumns = 3;
let gridX = 0;
let gridY = 0;
let gridWidth = aliensWidth * aliensColumns;
let gridHeight = aliensHeight *  aliensRows;

let numberAliens = 0;
let aliensDisplacementX = 1;
let aliensMovement = false;

let enemiesAttaksArray = [];
let enemiesAttaksDisplacementY = 5;

let starsArray = [];
let starsDisplacementY = 1;

let shootsArray = [];
let shootsDisplacementY = -10;

let explosionsArray = [];
let explosionFragments = 40; 

let points = 0;
let level = 1;
let record = 0;
let gameOver = true;
let run = false;
let start = false;
let playAgain = false;
let createStartButton = false;

window.onload = function() {
  screen = document.getElementById('screen');
	screen.width = screenWidth;
	screen.height = screenHeight;
	context = screen.getContext('2d');

  shipImg = new Image();
  shipImg.src = "./assets/nave.png";
  shipImg.onload = function() {
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
  }

  aliensImg = new Image();
  aliensImg.src = "./assets/alien1.png";

  createStars();
  // createAliens();

  setInterval(moveShip, 25);
  setInterval(aliensAnimation, 400);
  setInterval(decideEnemyAttack, 1000);
  setInterval(createStartButtonFunc, 3000);

  requestAnimationFrame(update);

  const leftButton = document.getElementById("left");
  leftButton.addEventListener("click", () => ship.direction = -shipDisplacementX);

  const rightButton = document.getElementById("right");
  rightButton.addEventListener("click", () => ship.direction = shipDisplacementX);

  const fireButton = document.getElementById("fire");
  fireButton.addEventListener("click", openFire);

  pointsScoreBoard = document.getElementById("btn-points");
  pointsScoreBoard.innerText += " " + points.toString();

  levelIndicator = document.getElementById("btn-level");
  levelIndicator.innerText += " " + level.toString();

  recordIndicator = document.getElementById("btn-points");
}

function update() {
  requestAnimationFrame(update);
  context.clearRect(0, 0, screen.width, screen.height);

  updateStars();

  if(!gameOver) {
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height)
  } 

  updateAliens();
  updateShoots();
  updateEnemiesAttacks();
  updateExplosions();

  if (gameOver) {
    context.font = "bold 60px seriff";
    context.fillStyle = "red";
    context.fillText("Game Over", 10, screen.height / 2);
  }

}

function updateStars() {
  for (let i = 0; i < starsArray.length; i ++) {
    let stars = starsArray[i];
    stars.y += starsDisplacementY;

    if (stars.y > screenHeight + 1) {
      stars.y = 0;
      stars.x = Math.floor(Math.random()*screenWidth);
    }

    context.fillStyle = stars.color;
    context.fillRect(stars.x, stars.y, stars.width, stars.height);
  }
}

function updateAliens() {
  for (let i = 0; i < aliensArray.length; i++) {
    let aliens = aliensArray[i];
    if (aliens.active) {
      aliens.x = gridX + aliens.forX;
      aliens.y = gridY + aliens.forY;

      if (aliens.active && !gameOver && checkColision(aliens, ship)) {
        aliens.active = false;
        gameOver = true;
        run = false;
        createStartButton = false;
        createExplosion(ship.x, ship.y, "orange", 99);
      }

      if (aliens.y > screen.height && !gameOver) {
        gameOver = true;
        run = false;
        createStartButton = false;
        createExplosion(ship.x, ship.y, "orange", 99);
      }

      if (aliensMovement) {
        aliensImg.src = "./assets/alien3.png"
      } else {
        aliensImg.src = "./assets/alien1.png"
      }

      context.drawImage(aliensImg, aliens.x, aliens.y, aliens.width, aliens.height);
    }
  }

  if (start) {
    gridX += aliensDisplacementX;
    if (gridX + gridWidth >= screen.width || gridX <= 0) {
      aliensDisplacementX = -aliensDisplacementX;
      gridY += aliensHeight / 2;
    } 
  }
 
}

function updateShoots() {
  for (let i = 0; i < shootsArray.length; i ++) {
    let shoots = shootsArray[i];
    shoots.y += shootsDisplacementY;

    context.fillStyle = "lightblue";
    context.fillRect(shoots.x, shoots.y, shoots.width, shoots.height);

    for (let ii = 0; ii < aliensArray.length; ii++) {
      let alien = aliensArray[ii];
      if (!(shoots.used) && alien.active && checkColision(shoots, alien)) {
        shoots.used = true;
        alien.active = false;
        numberAliens --;
        points ++;
        pointsScoreBoard.innerText = "Puntos: " + points.toString();
        createExplosion(alien.x, alien.y, "lightgreen", 25);
        levelComplete();
      }
    }
  }

  while (shootsArray.length > 0 && (shootsArray[0].used || shootsArray[0].y < 0)) {
    shootsArray.shift();
  }
}

function updateEnemiesAttacks() {
  for (let i = 0; i < explosionsArray.length; i++) {
    let explosion = explosionsArray[i];
    explosion.x += explosion.displacementX;
    explosion.y += explosion.displacementY;
    explosion.countDown --;

    context.fillStyle = explosion.color;
    context.fillRect(explosion.x, explosion.y, explosion.width, explosion.height);
  }
}

function updateExplosions() {
  for (let i = 0; i < enemiesAttaksArray.length; i++) {
    let attackEnemy = enemiesAttaksArray[i];
    attackEnemy.y += enemiesAttaksDisplacementY;

    context.fillStyle = "orchid";
    context.fillRect(attackEnemy.x, attackEnemy.y, attackEnemy.width, attackEnemy.height);

    if (!(attackEnemy.used) && checkColision(attackEnemy, ship) && !(gameOver)) {
      attackEnemy.used = true;
      gameOver = true;
      run = false;
      createStartButton = false;
      createExplosion(ship.x, ship.y, "orange", 99);
    }
  }

  while (explosionsArray.length > 0 && explosionsArray[0].countDown <= 0) {
    explosionsArray.shift();
  }
}

function moveShip() {
  if (ship.x + ship.width + ship.direction > screen.width) {
    ship.x = screen.width - ship.width;
    return false;
  } else if (ship.x + ship.direction <= 0) {
    ship.x = 0;
    return false;
  }
  ship.x += ship.direction;
}

function createStars() {
  for (let i = 0; i < NumOfStars; i ++) {
    let colorsList = ["yellow", "white", "crimson", "cyan", "dodgerblue", "deeppink", "lime", "white"];
    let whatColor = Math.floor(Math.random()*colorsList.length);
    let size = Math.floor(Math.random()*2) + 1;

    let stars = {
      x: Math.floor(Math.random()*screenWidth),
      y: Math.floor(Math.random()*screenHeight),width: size,
      height: size,
      color: colorsList[whatColor]
    }

    starsArray.push(stars);
  }
}

function openFire() {
  if (gameOver) return;
  ship.direction = 0;

  let shoots = {
    x: ship.x + ship.width / 2,
    y: ship.y,
    width: 2,
    height: BSY / 2,
    used: false
  }
  shootsArray.push(shoots);
}

function createAliens() {
  for (let y = 0; y < aliensRows; y++) {
    for (let x = 0; x < aliensColumns; x++) {
      let aliens = {
        img: aliensImg,
        width: aliensWidth,
        height: aliensHeight,
        forX: gridX + x * aliensWidth * aliensMarginX,
        forY: gridY + y * aliensHeight * aliensMarginY,
        x: gridX + x * aliensWidth * aliensMarginX,
        y: gridY + y * aliensHeight * aliensMarginY,
        active: true
      }

      aliensArray.push(aliens);
    }
  }
  numberAliens = aliensArray.length;
}

function aliensAnimation() {
  if (aliensMovement) {
    aliensMovement = false;
  } else {
    aliensMovement = true;
  }
}

function decideEnemyAttack() {
  for (let i = 0; i < aliensArray.length; i++) {
    let aliens = aliensArray[i];

    if (aliens.active) {
      let attack = Math.floor(Math.random()*99);

      if (attack < level * 3) {
        createAttackEnemy(aliens);
      }
    }
  }
}

function createAttackEnemy(aliens) {
  let attackEnemy = {
    x: aliens.x + aliens.width / 2,
    y: aliens.y + aliens.height,
    width: 6,
    height: 6,
    used: false
  }
  enemiesAttaksArray.push(attackEnemy);
}

function checkColision(shoot, alien) {
  return shoot.x < alien.x + alien.width 
  && shoot.x + shoot.width > alien.x
  && shoot.y < alien.y + alien.height
  && shoot.y + shoot.height > alien.y;
}

function createExplosion(x, y, qcolor, cdown) {
  for (let i = 0; i < explosionFragments; i++) {
    let size = Math.floor(Math.random()*3) + 2;

    let explosion = {
      x,
      y,
      width: size,
      height: size,
      displacementX: Math.floor(Math.random()*11) - 5,
      displacementY: Math.floor(Math.random()*11) - 5,
      color: qcolor,
      countDown: cdown
    }
    explosionsArray.push(explosion);
  }
}

function levelComplete() {
	if (numberAliens > 0) return false;

  level ++;
  levelIndicator.innerText = `Nivel: ${level.toString()}`;

  if (aliensColumns >= 8) {
    if (aliensRows <= 9) {
      aliensRows ++;
    }
  } else {
    aliensColumns ++;
  }

  gridX = 2;
  gridY = 0;
  gridWidth = aliensWidth * aliensColumns;
  gridHeight = aliensHeight * aliensRows;
  aliensArray.splice(0, aliensArray.length);
  createAliens();
  return true;
}

function createStartButtonFunc() {
  if (createStartButton) return false;

  startButton = document.createElement("button");
  startButton.style.width = "318px";
  startButton.style.height = "50px";
  startButton.style.marginTop = "1px";
  startButton.style.fontSize = "32px";
  startButton.style.fontWeight = "700";
  startButton.style.color = "yellow";
  startButton.style.backgroundColor = "seagreen";
  startButton.innerText = "Comenzar";
  document.body.children[0].appendChild(startButton);
  startButton.addEventListener("click", startGameFunc);

  createStartButton = true;
}

function startGameFunc() {
  if (run) return false;

  if (playAgain) location.reload();

  run = true;
  gameOver = false;
  start = true;
  playAgain = true;
  createAliens();
  document.body.children[0].removeChild(startButton);
}