const canvas = document.getElementById("game-canvas");
let score = 0;
let highScore = 0;
let gap = 0;
let audiocount = 0;

class Masya {
  constructor() {
    this.context = canvas.getContext("2d");
    this.x = canvas.width / 2;
    this.y = canvas.height - 200;
    this.image = new Image();
    this.image.src = "assets/right.png";
    this.prevY = this.y;
    this.width = 75;
    this.height = 75;
    this.velocityY = 0;
    this.velocityX = 0;
    this.gravity = 0.03;
    this.jumpV = -2.5;
  }

  updatePosition() {
    this.prevY = this.y;
    this.x += this.velocityX;
    this.y += this.velocityY;
    if (this.velocityY > 3.5) {
      this.velocityY = 3.5; // terminal velocity
    } else {
      this.velocityY += this.gravity; // increments velocity by gravity constant
    }
    this.checkWrap();
  }

  checkWrap() {
    if (this.x + this.width < 0) {
      this.x = canvas.width;
    } else if (this.x > canvas.width) {
      this.x = 0 - this.width;
    }
  }

  checkContact() {
    if (this.velocityY <= 0) {
      return;
    }

    for (let i = 0; i < platforms.length; i++) {
      let plat = platforms[i];
      if (
        this.prevY + this.height + 20 >= plat.y &&
        this.x + this.width > plat.x &&
        this.x < plat.x + plat.width &&
        this.y + this.height > plat.y &&
        this.y < plat.y + plat.height &&
        this.prevY < plat.y
      ) {
        this.jump(plat);
      }
    }
  }

  jump(plat) {
    let newHeight = plat.y - this.height;
    if (newHeight > canvas.height / 2 - 120) {
      this.y = plat.y - this.height;
      this.velocityY = this.jumpV;
    }
  }

  moveR() {
    this.velocityX = 3;
    this.image.src = "assets/right.png";
  }

  moveL() {
    if (this.velocityX > -3) {
      this.velocityX = -3;
      this.image.src = "assets/left.png";
    }
  }

  draw() {
    this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

class Platform {
  constructor(x, y) {
    this.context = canvas.getContext("2d");
    this.image = new Image();
    this.image.src = "assets/bone.png";
    this.x = x;
    this.y = y;
    this.width = 100;
    this.height = 20;
  }

  draw() {
    this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

let platforms = [];
const masya = new Masya();

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showEnd() {
  document.getElementById("end-menu").style.display = "block";
  document.getElementById("end-menu").style.animation =
    "spin2 0.2s linear";
  document.getElementById("end-score").innerHTML = score;

  if (highScore < score) {
    highScore = score;
  }

  document.getElementById("high-score").innerHTML = highScore;
}

function hideEnd() {
  document.getElementById("end-menu").style.display = "none";
}

function controls() {
  const audio = document.createElement("AUDIO");
  document.body.appendChild(audio);
  audio.src = "assets/music.mp3";
  document.addEventListener("keydown", function (event) {
    if (event.code === "ArrowLeft") {
      masya.moveL();
    } else {
      masya.moveR();
    }
    audio.play();
  });

  document.addEventListener("keyup", function (event) {
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      masya.velocityX = 0;
    }
    audio.play();
  });

  document.getElementById("start-over").addEventListener("click", function () {
    hideEnd();
    resetGame();
    loop();
    audio.play();
  });
}

function createPlats(countPlatform) {
  gap = Math.round(canvas.height / countPlatform);
  for (let i = 0; i < countPlatform; i++) {
    let xPosition = 0;
    do {
      xPosition = rand(5, canvas.width - 5 - 100); // REVIEW THIS (WHY 25???)
    } while (
      xPosition > canvas.width / 2 - 100 * 1.5 &&
      xPosition < canvas.width / 2 + 100 / 2
    );
    let y = canvas.height / 1.5 - i * gap;
    platforms.push(new Platform(xPosition, y)); // WE NEED TO CHANGE THE CONSTRUCTOR
  }
}

function setup() {
  platforms.push(new Platform(masya.x, masya.y + 100));
  createPlats(6);
}

function resetGame() {
  masya.x = canvas.width / 2;
  masya.y = canvas.height - 200;
  masya.velocityX = 0;
  masya.velocityY = 0;
  score = 0;
  platforms = [];
  setup();
}

function updatePlatformsAndScore() {
  let platforms2 = [...platforms];
  platforms = platforms.filter((platform_) => platform_.y < canvas.height);
  score += platforms2.length - platforms.length;
  document.getElementById("end-score").innerHTML = score;
  document.getElementById("end-score-2").innerHTML = score;
}

function loop() {
  masya.context.clearRect(0, 0, canvas.width, canvas.height);

  if (masya.y < canvas.height / 2 && masya.velocityY < 0) {
    platforms.forEach((platform) => {
      platform.y += -masya.velocityY * 2;
    });
    platforms.push(
      new Platform(
        rand(5, canvas.width - 5 - 100),
        platforms[platforms.length - 1].y - gap * 1.75
      )
    );
  }

  masya.draw();
  masya.updatePosition();

  platforms.forEach((platform) => {
    platform.draw();
  });

  masya.checkContact();

  if (masya.y > canvas.height) {
    showEnd();
    return;
  }

  updatePlatformsAndScore();

  requestAnimationFrame(loop);
}

controls();
setup();
loop();