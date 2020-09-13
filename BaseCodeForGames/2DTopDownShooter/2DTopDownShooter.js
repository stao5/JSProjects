let canvas = document.getElementById("draw")
let ctx = canvas.getContext('2d')

let gameContainer = document.getElementById("gameContainer")
let startButton = document.getElementById("startBtn")
let container = document.getElementById("container")
let title = document.getElementById("title")
let pauseButton = document.getElementById("pauseButton")
let pausePage = document.getElementById("pausePage")

let resume = document.getElementById("resume")
let returnMenu = document.getElementById("return")

let health = document.getElementById("health")
let scoreDisplay = document.getElementById("score")
let waveDisplay = document.getElementById("wave")
let bombDisplay = document.getElementById("grenades")

let endPage = document.getElementById("endPage")
let restart = document.getElementById("restart")
let endReturn = document.getElementById("endReturn")
let highscoreDisplay = document.getElementById("highscore")
let finalScore = document.getElementById("endScore")


const UPKEY = 87
const DOWNKEY = 83
const LEFTKEY = 65
const RIGHTKEY = 68
const BOMBKEY = 71

let mouseX
let mouseY

let centerX
let centerY

let wave = 0

let keys = []

let activeBullets = []
let activeEnemies = []

let gameover = false
let gamePaused = false

let activeHealthkits = []
let activeBombs = []

let releasedBombs = []

let invBombs = 0

let pressed = false

let score = 0

if(localStorage.getItem("highscore") == null){
    localStorage.setItem("highscore", 0)
}

let highscore = localStorage.getItem("highscore")


class enemies {
    constructor(x, y, width, height, angle){
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.angle = angle

        this.dx = 2
        this.dy = 2
        
    }

    draw(){

        ctx.fillStyle = "#388a38"

        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
        ctx.restore()


    }

    move(){
        
        if(this.x != centerX && this.y != centerY)
            this.x -= this.dx * Math.cos(this.angle)
            this.y -= this.dy * Math.sin(this.angle)

    }
}

class bullets {
    constructor(x, y, angle){
        this.x = x
        this.y = y
        this.width = 20
        this.height = 10
        this.angle = angle

        this.dx = 10
    }
    

    draw(){
       
        ctx.fillStyle = "#c1c928"
        ctx.save()

        ctx.translate(this.x, this.y);

        ctx.rotate(this.angle)
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)

        ctx.restore()
        
        
    }

    updateBullet(){
        this.x += this.dx * Math.cos(this.angle)
        this.y += this.dx * Math.sin(this.angle)
         

    }
}

class powerup {
    constructor(x, y, width, height, type){
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.type = type

    }

    draw(){
        switch(this.type){
            case 1:
                ctx.fillStyle = "#0000FF"
                ctx.fillRect(this.x, this.y, this.width, this.height)
                break
            
            case 2:
                ctx.fillStyle = "#ED9F18"
                ctx.fillRect(this.x, this.y, this.width, this.height)
                break
        }
    }
}


class bombs {
    constructor(x, y, targetX, targetY, radius, angle){
        this.x = x
        this.y = y

        this.targetX = targetX
        this.targetY = targetY

        this.radius = radius
        this.angle = angle

        this.dx = 6
        this.dy = 6

        this.state = 0
    }

    move(){

        if(!((this.x > this.targetX - 10 && this.x < this.targetX + 10) && (this.y > this.targetY - 10 && this.y < this.targetY + 10))){
            this.x += this.dx * Math.cos(this.angle)
            this.y += this.dy * Math.sin(this.angle)
            
        } else if(this.state != 2){
            this.state = 1
            this.radius = 100

            
        }
    }

    draw(){


        if(!((this.x > this.targetX - 10 && this.x < this.targetX + 10) && (this.y > this.targetY - 10 && this.y < this.targetY + 10))){
            ctx.fillStyle = "#24fc08"
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
            ctx.stroke()
            ctx.fill()
            
        } else {     
            
            
            ctx.fillStyle = "#fc6603"
            ctx.strokeStyle = "#fc6603"
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
            ctx.stroke()
            ctx.fill()
        }        
    }
}


let character = {
    x: 0,
    y: 0,
    width: 50,
    height: 50,

    health: 100,

    

    shoot: function(){
        let bullet = new bullets(centerX + 25 * Math.cos(getAngle(mouseY, mouseX)), centerY + 25 * Math.sin(getAngle(mouseY, mouseX)), getAngle(mouseY, mouseX))
        activeBullets.push(bullet)
    }
}

let healthbar = {
    x: 0,
    y: 0, 
    width: 100,
    height: 10

}

let depleatedHealth = {
    x: 0,
    y: 0, 
    width: 0,
    height: 10
}

function powerupGeneration(){
    if(Math.floor(Math.random() * 24  + 1) == 1){
        let healthkit = new powerup(Math.random() * (canvas.width - 150) + 150 , Math.random() * (canvas.height - 150) + 150, 20, 20, 1)
        activeHealthkits.push(healthkit)
    }
    if(Math.floor(Math.random() * 49 + 1) == 1){
        let bombDetonate = new powerup(Math.random() * (canvas.width - 150) + 150, Math.random() * (canvas.height - 150) + 150, 20, 20, 2)
        activeBombs.push(bombDetonate)
    }

    
}

function pauseGame(event){
    if(gameover == false && gamePaused == false){
        gamePaused = true
        pausePage.style.display = "flex"
    }
}

function resumeGame(event){
    if(gameover == false && gamePaused == true){
        gamePaused = false
        pausePage.style.display = "none"
        endPage.style.display = "none"
        requestAnimationFrame(nextFrame)
    }
}

function returnToMenu(event){
    if(gamePaused == true || gameover == true){
        pausePage.style.display = "none"
        endPage.style.display = "none"
        gameContainer.style.display = "none"
        container.style.display = "flex"
    }
}


function pageOnload(){
    
    document.addEventListener("keydown", keyDown)
    document.addEventListener("keyup", keyUp)
    
    canvas.addEventListener("mousemove", mouseMove)
    canvas.addEventListener("click", Shoot)

    pauseButton.addEventListener("click", pauseGame)
    resume.addEventListener("click", resumeGame)
    returnMenu.addEventListener("click", returnToMenu)

    endReturn.addEventListener("click", returnToMenu)
    restart.addEventListener("click", reset)
}

function reset(){
    gameover = false
    gamePaused = false
    
    pressed = false

    wave = 0
    invBombs = 0
    score = 0

    character.health = 100

    activeEnemies = []
    activeBullets = []
    activeHealthkits = []
    activeBombs = []
    releasedBombs = []

    health.innerHTML = "Health: " + character.health
    scoreDisplay.innerHTML = "Score: " + score
    waveDisplay.innerHTML = "Wave: 1"
    bombDisplay.innerHTML = "Grenades: " + invBombs
    endPage.style.display = "none"
    
    character.x = canvas.width / 2 - character.width/2
    character.y = canvas.height / 2 - character.height/2

    character.health = 100

    enemyGeneration()
    requestAnimationFrame(nextFrame)
   
}

function init(){

    gameContainer.style.display = "block"
    container.style.display = "none"
    pauseButton.style.display = "block"
    health.style.display = "flex"
    scoreDisplay.style.display = "flex"
    waveDisplay.style.display = "flex"
    bombDisplay.style.display = "flex"

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    reset()

}

function getAngle(corY, corX){
    return Math.atan2(corY - centerY, corX - centerX)
}

function Shoot(event){
    character.shoot()
}

function keyDown(event){
    keys[event.keyCode] = true

}

function keyUp(event){
    delete keys[event.keyCode]
}

function mouseMove(event){

    let rect = draw.getBoundingClientRect()

    mouseX = event.x - rect.left
    mouseY = event.y - rect.top
}

function checkMovement(){
    if(UPKEY in keys && character.y >= 0){
        character.y -= 3
    }
    if(DOWNKEY in keys && character.y + character.height <= canvas.height){
        character.y += 3
    }
    if(LEFTKEY in keys && character.x + character.width/2 >= 0){
        character.x -= 3
    }
    if(RIGHTKEY in keys && character.x + character.width/2 <= canvas.width){
        character.x += 3
    }

    if(BOMBKEY in keys && invBombs > 0 && pressed != true) {
        invBombs -= 1

        bombDisplay.innerHTML = "Grenades: " + invBombs

        let bomb = new bombs(centerX, centerY, mouseX, mouseY, 10, getAngle(mouseY, mouseX))

        pressed = true

        releasedBombs.push(bomb)
        
    } else if(!(BOMBKEY in keys)){
        pressed = false
    }
}

function withinCanvas(rect1){
    if(rect1.x > canvas.width){
        return false
    } else if(rect1.x < 0){
        return false
    } else if (rect1.y  < 0){
        return false
    } else if(rect1.y > canvas.height){
        return false
    } else {
        return true
    }
}

function rotate(){

    let charAngle = getAngle(mouseY, mouseX)

    ctx.save()

    ctx.translate(centerX, centerY)
    ctx.rotate(charAngle)

    ctx.fillStyle = "black"
    ctx.fillRect(-character.width / 2, -character.height/2, character.width, character.height)

    ctx.restore()
}

function enemyGeneration(){
    if(activeEnemies.length == 0){

        score += wave * 10
        scoreDisplay.innerHTML = "Score: " + score

        wave++
        waveDisplay.innerHTML = "Wave: " + wave

        
        
        setTimeout(()=>{


            let totalTime = 0;

            for(let i = 0; i < wave * 4; i++){

                

                let offset = 300 + Math.random() * 500

                let type = Math.floor(Math.random() * 4)
        
                let enemy = new enemies(null, null, 40, 40, null)
        
                switch(type) {
                    case 0:
                        enemy.x = canvas.width + 20
                        enemy.y = Math.floor(Math.random() * canvas.height)
                        break
        
                    case 1:
                        enemy.x = Math.floor(Math.random() * canvas.width)
                        enemy.y = canvas.height + 20
                        break
                    
                    case 2:
                        enemy.x = -20
                        enemy.y = Math.floor(Math.random() * canvas.height)
                        break
                    
                    case 3:
                        enemy.x = Math.floor(Math.random() * canvas.width)
                        enemy.y = -20
        
                }
                
                enemy.angle = getAngle((enemy.y + enemy.height / 2),(enemy.x + enemy.width / 2))
                
                setTimeout(() => {activeEnemies.push(enemy)}, offset + totalTime)
                setTimeout(powerupGeneration, offset + totalTime)

                totalTime += offset
            
            }
        }, 1000)
        
    }
}



function enemyCollisions(rect1, rect2){
    if(rect1.x + rect1.width / 2 > rect2.x - rect2.width / 2 
        && rect1.x - rect1.width / 2 < rect2.x + rect2.width /2
        && rect1.y + rect1.height / 2 > rect2.y - rect2.height / 2
        && rect1.y - rect1.height / 2 < rect2.y + rect2.height / 2 ){

            return true
            
        }

}

function playerCollisions(rect1, rect2){
    if(rect1.x + rect1.width / 2 > rect2.x
        && rect1.x - rect1.width / 2 < rect2.x + rect2.width
        && rect1.y + rect1.height / 2 > rect2.y
        && rect1.y - rect1.height / 2 < rect2.y + rect2.height){

            return true
            
        }
}

function itemCollisions(rect1, rect2){
    if(rect1.x < rect2.x + rect2.width 
        && rect1.x + rect1.width > rect2.x 
        && rect1.y < rect2.y + rect2.height 
        && rect1.y + rect1.height > rect2.y ){
            
            return true
        }
}


function nextFrame(time){

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    checkMovement()

    centerX = character.x + character.height / 2
    centerY = character.y + character.height / 2


    healthbar.x = character.x - 25
    healthbar.y = character.y - 30

    depleatedHealth.x = character.x + character.width + 25
    depleatedHealth.y = character.y - 30

    healthbar.width = 100 * character.health / 100
    depleatedHealth.width = -(100 - character.health)


    for(let bomb of releasedBombs){
        bomb.move()
    }

    


    for(let i = 0; i < activeEnemies.length; i++){
            

        for(let j = i + 1; j < activeEnemies.length; j++){

            if(enemyCollisions(activeEnemies[i], activeEnemies[j])){

                activeEnemies[j].dx = 3
                activeEnemies[j].dy = 3

            }
        }

        if(playerCollisions(activeEnemies[i], character) && character.health > 0){
            character.health -= 0.1
            health.innerHTML = "Health: " + Math.ceil(character.health)
        } else if(character.health <= 0){
            healthbar.width = 0
            character.health = 0
            depleatedHealth.width = -100
            gameover = true
            health.innerHTML = "Health: " + Math.ceil(character.health)
        }

        activeEnemies[i].move()
        
    }

   

    for(let i = 0; i < activeHealthkits.length; i++){
        if(itemCollisions(character, activeHealthkits[i])){
            if(character.health >= 90){
                character.health = 100
                health.innerHTML = "Health: " + Math.ceil(character.health)
            } else {
                character.health += 10
                health.innerHTML = "Health: " + Math.ceil(character.health)
            }

            activeHealthkits.splice(i, 1)

        }
    }
    
    for(let i = 0; i < activeBombs.length; i++){
        if(itemCollisions(character, activeBombs[i])){
            invBombs += 1
            bombDisplay.innerHTML = "Grenades: " + invBombs
            activeBombs.splice(i, 1)
        }
    }



    for(let i = 0; i < activeBullets.length; i++){
        activeBullets[i].updateBullet()
        if(withinCanvas(activeBullets[i])){
            activeBullets[i].draw()
        } else {
            activeBullets.splice(i, 1)
        }
        
    

    }

    for(let i = 0; i < activeEnemies.length; i++){

        activeEnemies[i].angle = getAngle(activeEnemies[i].y + activeEnemies[i].height / 2, activeEnemies[i].x + activeEnemies[i].width / 2)

        for(let j = 0; j < activeBullets.length; j++){

            if(i < activeEnemies.length && enemyCollisions(activeEnemies[i], activeBullets[j])){

                score++
                scoreDisplay.innerHTML = "Score: " + score


                activeBullets.splice(j, 1)
                activeEnemies.splice(i, 1)
                enemyGeneration()

            }
        }
    }

    for(let i = releasedBombs.length - 1; i > -1; i--){

        for(let j = activeEnemies.length - 1; j > -1; j--){

                if(releasedBombs[i].state == 1 && j < activeEnemies.length
                    && Math.abs(activeEnemies[j].x - releasedBombs[i].x) <= releasedBombs[i].radius 
                    && Math.abs(activeEnemies[j].y - releasedBombs[i].y) <= releasedBombs[i].radius){

                        score++
                        scoreDisplay.innerHTML = "Score: " + score
                        activeEnemies.splice(j, 1)
                        enemyGeneration()

                    }
            

        }

        if(releasedBombs[i].state == 1){
            releasedBombs[i].state = 2;
        }

        if(releasedBombs[i].state == 2){

            (function(i){
                setTimeout(function(){ 
                  releasedBombs.splice(i, 1);
                }, 1500);
              })(i)

        }

    }

    
    

    for(let i = 0; i < activeEnemies.length; i++){
        activeEnemies[i].dx = 2
        activeEnemies[i].dy = 2
    }

    

    for(let enemy of activeEnemies){
        enemy.draw()
    }

    for(let healthkit of activeHealthkits){
        healthkit.draw()
    }

    for(let bomb of releasedBombs){
        bomb.draw()
    }


    for(let bombDetonate of activeBombs){
        bombDetonate.draw()
    }

    rotate()

    ctx.fillStyle = "#26D12E"
    ctx.fillRect(healthbar.x, healthbar.y, healthbar.width, healthbar.height)

    ctx.fillStyle = "#d40d0d"
    ctx.fillRect(depleatedHealth.x, depleatedHealth.y, depleatedHealth.width, depleatedHealth.height)
    
    if(gameover == false && gamePaused == false){
        requestAnimationFrame(nextFrame)
    } else if (gameover == true){
        endPage.style.display = "flex"
        finalScore.innerHTML = "Score: " + score

        if(score > highscore){
            localStorage.setItem("highscore", score)
            highscore = score
        }

        highscoreDisplay.innerHTML = "Highscore: " + highscore
        
    
    
    
    }
}

window.onload = pageOnload

startButton.onclick = init
