"use strict"

class UrlAttack {

    constructor() {
        //Cleanup in beginning
        history.pushState("", document.title, window.location.pathname);

        //Helper Variables
        this.url = window.location.hash;

        //Game Variables
        this.score = 0;
        this.impacts = 0;
        this.cannonLoaded = false;
        this.cannonState = 0;
        this.gameStringLength = 50;
        this.gameString = "";

        this.constructEmptyLevel();

        this.gameState = "intro";

        //Init Game
        this.init();
    }

    init () {
        var that = this;

        //Add event Listeners
        window.onkeydown = function(e) {
            var key = e.keyCode ? e.keyCode : e.which;
            if (key === 32 && that.score === 0 || key === 82 && that.gameState === "end") {
                that.score = 0;
                that.impacts = 0;
                that.gameState = "level-1";
            } else if (key === 83) {
                that.fireBullet();
            }
        }

        window.onkeyup = function(e) {
            var key = e.keyCode ? e.keyCode : e.which;
            if (key === 32) {
                setTimeout(function() {
                    this.keyPressed = false;
                }, 250);
            }
        }

        this.render();


    }

    constructEmptyLevel() {
        this.gameString = "";
        for(let i = 0; i < this.gameStringLength; i++) {
            this.gameString += "_";
        }
    }

    render() {
        let that = this;
        let counter = 0;
        setInterval(function() {
            //Counter for GameString Position
            if (counter < that.gameStringLength - 1) {
                counter ++
            } else {
                counter = 0;
            }

            switch (that.gameState) {
                case "intro":
                    that.drawMovingText(counter, "press_space_to_start_/_s_to_shoot");
                    break;
                case "level-1":
                    that.spawnTarget();
                    that.moveBullet();
                    that.moveTarget();
                    that.detectCollision();
                    that.setUrlBar(that.drawBattery() + that.gameString);
                    that.checkEndGame();
                    break;
                case "end":
                    that.drawMovingText(counter, "score:" + that.score +"_/_game_over_/_press_r_to_restart");
                    break;
                default:
                    that.drawMovingText(counter, "press_space_to_start_/_s_to_shoot");

            }


        }, 1000/20);
    }

    setUrlBar (gameString) {
        history.replaceState("Hallo!", "page 2", this.url + "#"+ gameString);
    }

    setCharAt(str, index, chr) {
        if(index > str.length-1) return str;
        return str.substr(0,index) + chr + str.substr(index+1);
    }

    /**
     * Moving text
     */
    drawMovingText(offset, text) {
        let movingText = text;
        if(movingText.length < this.gameStringLength) {
            let lengthDiff = this.gameStringLength - movingText.length;
            for (let i = 0; i < lengthDiff; i++) {
                movingText += "_";
            }
        }
        let firstPart = movingText.substr(offset, movingText.length);
        let secondPart = movingText.substr(0, offset);
        let outputString = firstPart + secondPart;
        this.setUrlBar(outputString);
    }

    /**
     * Battery
     */
    drawBattery () {
        let batteryString = this.loadCannon();
        for (let i = 0; i < 3 - this.impacts; i++) {
            batteryString += "|"
        }

        batteryString = "score:" + this.score + "_" + batteryString;
        return batteryString;
    }

    /**
     * Bullets
     */
    loadCannon() {
        let cannonSymbol = "";
        if(!this.cannonLoaded) {
            switch (this.cannonState) {
                case 0:
                    cannonSymbol = "-";
                    break;
                case 1:
                    cannonSymbol = "\\";
                    break;
                case 2:
                    cannonSymbol = "|";
                    break;
                case 3:
                    cannonSymbol = "/";
                    break;
                case 4:
                    cannonSymbol = "-";
                    break;
                case 5:
                    cannonSymbol = "\\";
                    break;
                case 6:
                    cannonSymbol = "|";
                    break;
                case 7:
                    cannonSymbol = "/";
                    break;
                case 8:
                    cannonSymbol = "X";
                    this.cannonLoaded = true;
                    break;
                default:
                    cannonSymbol = "X";
                    this.cannonLoaded = true;

            }
            if(this.cannonState < 8) {
                this.cannonState++;
            } else {
                this.cannonState = 0;
            }
        } else {
            cannonSymbol = "X"
        }
        return cannonSymbol;
    }


    fireBullet () {
        if(this.cannonLoaded) {
            this.gameString = this.setCharAt(this.gameString, 0, ">");
            this.cannonLoaded = false;
        } else {
            return;
        }
    }

    moveBullet () {
        for(let i = this.gameString.length - 1; i >= 0; i--) {
            if(this.gameString.charAt(i) === ">") {
                this.gameString = this.setCharAt(this.gameString, i, "_");
                this.gameString = this.setCharAt(this.gameString, i + 2, ">");
            }
        }
    }

    /**
     * Collision
     */
    detectCollision() {
        let bulletPosition = this.gameString.indexOf(">");
        let targetPosition = this.gameString.indexOf("*");
        //console.log("bulletPosition: " + bulletPosition + " / targetPosition: " + targetPosition);
        let diff = targetPosition - bulletPosition;
        /**
         * TODO: Find better collision detection, 2 digits don't look smooth
         */
        if(bulletPosition !== -1 && targetPosition !== -1 && diff <= 3) {
            this.score++;
            this.gameString = this.setCharAt(this.gameString, targetPosition, "_");
            this.gameString = this.setCharAt(this.gameString, bulletPosition, "_");
        } else if (targetPosition === 0 ) {
            this.impacts++;
        }
    }

    /**
     * Target
     * Increase
     */
    spawnTarget () {
        if(this.gameString.split("*").length < 5 && Math.random() >= (0.95 - this.score * 0.005)) {
                this.gameString = this.setCharAt(this.gameString, this.gameString.length - 1, "*");
        }
    }

    moveTarget() {
        for(let i = 0; i < this.gameString.length; i++) {
            if(this.gameString.charAt(i) === "*" && i > 0) {
                this.gameString = this.setCharAt(this.gameString, i, "_");
                this.gameString = this.setCharAt(this.gameString, i - 1, "*");
            } else if(this.gameString.charAt(i) === "*" && i === 0) {
                this.gameString = this.setCharAt(this.gameString, i, "_");
            }
        }
    }

    /**
     * End Game
     */
    checkEndGame() {
        if(this.impacts === 4) {
            this.gameState = "end";
        }
    }

}

var game = new UrlAttack();
