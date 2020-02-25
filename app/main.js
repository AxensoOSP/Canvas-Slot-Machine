/* const symbols = {
  SYM1: "./img/SYM1.png",
  SYM2: "./img/SYM2.png",
  SYM3: "./img/SYM3.png",
  SYM4: "./img/SYM4.png",
  SYM5: "./img/SYM5.png",
  SYM6: "./img/SYM6.png"
} */

const symbols = {
  SYM1: "./img/001-virus.png",
  SYM2: "./img/002-quarantine.png",
  SYM3: "./img/003-virus.png",
  SYM4: "./img/004-virus transmission.png",
  SYM5: "./img/005-pipette.png",
  SYM6: "./img/006-virus.png"
}

document.addEventListener("DOMContentLoaded", function () {
  gameArea = {
    SPIN_BUTTON_SRC: "./img/btn_disabled.png",
    ACTIVE_BUTTON_SRC: "./img/btn_start.png",
    // BG_IMAGE_SRC: "url('./img/BG.png')",
    // CANVAS_BORDER: "2px solid gray",
    SYMBOLS: symbols,
    canvas: document.getElementById('slot'),
    MODAL: document.getElementById('resultModal'),
    MODAL_CONTENT: document.querySelector('.modal-content'),

    start: function () { // Set canvas property
      this.canvas.width = 960;
      this.canvas.height = 536;
      this.context = this.canvas.getContext("2d");
      // this.canvas.style.border = this.CANVAS_BORDER;
      // this.canvas.style.backgroundImage = this.BG_IMAGE_SRC;
      // this.frame();
      this.canvasPos = this.canvas.getBoundingClientRect();
      this.loadSymbols(this.SYMBOLS);
      this.btn("inactive");
    },

    event: function () { // Event for click on spin button
      var _this = this;
      _this.canvas.addEventListener("click", function clickOnBtn(e) {
        var x = e.clientX,
          y = e.clientY;
        if (Math.pow(x - 884 - _this.canvasPos["x"], 2) + Math.pow(y - 278 - _this.canvasPos["y"], 2) < Math.pow(50, 2)) {
          _this.canvas.removeEventListener("click", clickOnBtn);
          _this.btn("inactive");
          _this.animateSymbols();
        }
      });
    },

    btn: function (type) { // Draw spin button
      var ctx = this.context;
      var button = new Image();
      if (type === "inactive") {
        button.src = this.SPIN_BUTTON_SRC;
      } else if (type === "active") {
        button.src = this.ACTIVE_BUTTON_SRC;
        gameArea.event();
      }
      button.onload = function () {
        ctx.drawImage(button, 824, 218);
      }
    },

    // frame: function () { // Draw middle frame
    //   var ctx = this.context;
    //   ctx.beginPath();
    //   ctx.lineWidth = "4";
    //   ctx.strokeStyle = "MidnightBlue";
    //   const P = 5;
    //   ctx.rect(69 - P, 187 - P, (180 + P) * 4, 161 + P * 2);
    //   ctx.stroke();
    // },

    clear: function () { // Clear slot machine
      this.context.clearRect(0, 0, 800, this.canvas.height);
    },

    showModal: function (win, title) {
      this.btn("inactive");
      this.MODAL_CONTENT.style.borderColor = win ? "var(--green)" : "var(--red)";
      document.querySelector(".modal .modal-title").innerHTML = title;
      this.MODAL.classList.add("show");
      this.MODAL.removeAttribute("aria-hidden");
      this.MODAL.setAttribute("aria-modal", true);
    },

    hideModal: function () {
      this.btn("active");
      this.MODAL.classList.remove("show");
      this.MODAL.setAttribute("aria-hidden", true);
      this.MODAL.removeAttribute("aria-modal");
    },

    loadSymbols: function (symbols) { // Create array with loaded images
      var symbolsNum = Object.keys(symbols).length;
      var images = [];

      for (var key in symbols) {
        var image = new Image();
        image.src = symbols[key];
        image.dataset.name = key;
        image.onload = (function (value) {
          return function () {
            images.push(value);
            if (images.length === symbolsNum) {
              gameArea.imagesArr = images;
              gameArea.createSymbols();
              gameArea.btn("active");
            }
          }
        })(image);
      }
    },

    createSymbols: function () { // Method to create, save and first draw symbol objects
      var symbolsArr = [];
      var positionsX = [69, 309, 553];
      var positionsY = [-170, 10, 190, 370];
      for (var i = 0; i < positionsX.length; i++) {
        for (var j = 0; j < positionsY.length; j++) {
          var randSym = Math.floor(Math.random() * 6);
          var symbol = new Symbol(randSym, positionsX[i], positionsY[j]);
          symbol.drawElement(positionsX[i], positionsY[j]);
          symbolsArr.push(symbol);
        }
      }
      this.symbolsArr = symbolsArr;
    },

    animateSymbols: function () { // Moving symbols
      var _this = this;
      var symArr = this.symbolsArr;
      var speed = 13;
      var lap = speed * 180;
      var actualDis = -speed;

      var round = setInterval(function () {
        _this.clear();
        actualDis += speed;
        if (actualDis === lap) {
          speed -= 2;
          actualDis = 0;
          lap = speed * 180;
        }
        if (speed === 7) {
          speed = 0;
          clearInterval(round);
          _this.checkResult();
        }
        for (var i = 0; i < symArr.length; i++) {
          symArr[i].drawElement(symArr[i].posX, symArr[i].posY += speed);

          if (symArr[i].posY >= 550) { // Replace the symbol which is under canvas by new which is above canvas
            var randSym = Math.floor(Math.random() * 6);
            symArr[i] = new Symbol(randSym, symArr[i].posX, (symArr[i].posY - 550 - 170));
          }
        }
        // _this.frame();
      }, 5);
    },

    checkResult: function () { // Match symbol selected by player with symbol selected by machine
      var middleRow = [69, 309, 553], // left, center, right
        randRow = this.symbolsArr.filter(s => s.posY == 190 && middleRow.includes(s.posX)),
        outcome = randRow.every(s => randRow[0].name === s.name);

      setTimeout(() => {
        outcome ? this.showModal(true, "Win") : this.showModal(false, "Loss");
        // Math.random() <= 0.5 ? this.showModal(true, "Win") : this.showModal(false, "Loss");
      }, 500);
    },

    winAnimation: function (selected) { // Resize symbol animation if win scenario
      var ctx = this.context;
      var selImg = this.imagesArr[selected.arrIndex];
      var selposX = selected.posX;
      var selposY = selected.posY;
      var imgW = 235;
      var imgH = 155;
      var step = 0;
      var winAnimation = setInterval(function () {
        ctx.clearRect(299, 165, 255, 190);
        step++;
        if (step < 10) {
          ctx.drawImage(selImg, selposX--, selposY--, imgW += 2, imgH += 2);
        } else {
          ctx.drawImage(selImg, selposX++, selposY++, imgW -= 2, imgH -= 2);
          step > 20 ? clearInterval(winAnimation) : true;
        }
        // gameArea.frame();
      }, 50);
    }
  }

  function Symbol(arrIndex, posX, posY) { // Constructor to create new symbol object
    this.arrIndex = arrIndex;
    this.name = gameArea.imagesArr[this.arrIndex].dataset.name;
    this.posX = posX;
    this.posY = posY;
  }

  Symbol.prototype.drawElement = function (posX, posY) {
    var ctx = gameArea.context;
    var img = gameArea.imagesArr[this.arrIndex];
    ctx.drawImage(img, posX, posY);
  };

  gameArea.start();
});