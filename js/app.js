document.addEventListener("DOMContentLoaded", () => {
    let isGameOver = false
    let px = "px";
    let grid = document.querySelector(".grid");
    let gridWidth = 400;
    let score = document.createElement('div')
    let bird;
    let birdWidth = 41;
    let birdHeight = 30;
    let birdWingSfx = 'sfx_wing.mp3';
    let birdPointSfx = 'sfx_point.mp3';
    let birdDieSfx = 'sfx_die.mp3'
    let jumpHeight = 70;
    let birdJumpStartPoint;
    let isBirdJumping = false;
    let birdMovementDownTimerId;
    let birdMovementUpTimerId;
    let pipesMovementTimerId;
    let pipes = [];
    let pipepWidth = 60;
    let gapBetweenPipes = 145;

    let playButton = document.querySelector('.play')
    playButton.addEventListener('click', () => {
        playButton.style.display = 'none'
        controlsButton.style.display = 'none'
        start()
    })

    let controlsButton = document.querySelector('.controls')

    let controlsInfo = document.querySelector('.overlay')
    controlsButton.addEventListener('click', () => {
        controlsInfo.classList.add('visible')
    })
    let closeControlsInfo = document.querySelector('.close-overlay-btn')
    closeControlsInfo.addEventListener('click', () => { controlsInfo.classList.remove('visible') })

    class Bird{
        constructor(top, left){
            this.top = top;
            this.left = left;
            this.visual = document.createElement("div");
            this.visual.classList.add("bird");
            this.visual.style.top = top + px;
            this.visual.style.left = left + px;
        }
    }
     
    function createBird() {
        bird = new Bird(300, 155)
        grid.appendChild(bird.visual)
    }

    class Pipe {
        constructor(height, top, left) {
            this.top = top
            this.left = left
            this.height = height
            this.visual = document.createElement("div")
            this.visual.classList.add("pipe")
            this.visual.style.height = height + px
            this.visual.style.top = top + px
            this.visual.style.left = left + px
            this.passedByBird = false
        }
    }

    function moveBirdDown() {
        clearInterval(birdMovementUpTimerId)
        isBirdJumping = false
        
        birdMovementDownTimerId = setInterval(function() {
            bird.top += 1
            bird.visual.style.top = bird.top + px
            if (bird.top == 500 - birdHeight){
                gameOver()
            }
        }, 4.8);
    }

    function moveBirdUp() {
        clearInterval(birdMovementDownTimerId)
        birdWingSfx.load()
        birdWingSfx.play()
        birdMovementUpTimerId = setInterval(function() {
            bird.top -= 2
            bird.visual.style.top = bird.top + px
            if (bird.top <= birdJumpStartPoint - jumpHeight || bird.top <= -20) {
                moveBirdDown()
            }
        }, 2.5)
    }

    function control(e) {
        if(isBirdJumping || isGameOver) return
        switch (e.toString()) {
            case "[object KeyboardEvent]" :
                if ((e.key == " " || e.key == "w" || e.key == "ArrowUp")) {
                    isBirdJumping = true
                    birdJumpStartPoint = bird.top
                    moveBirdUp()
                }
                break;

            case "[object MouseEvent]" :
                isBirdJumping = true
                birdJumpStartPoint = bird.top
                moveBirdUp()
                break
        }
    }

    function createPipe(left) {
            let topBottomPipes = []
            let height = Math.random() * 340 + 10
            let topPipe = new Pipe(height, 0, left)
            let bottomPipe = new Pipe(500 - (height + gapBetweenPipes), height + gapBetweenPipes, left)
            topBottomPipes.push(topPipe)
            topBottomPipes.push(bottomPipe)
            pipes.push(topBottomPipes)
            grid.appendChild(topPipe.visual)
            grid.appendChild(bottomPipe.visual)
    }

    function removePipes() {
        pipes.forEach(topBottomPipes => {
            grid.removeChild(topBottomPipes[0].visual)
            grid.removeChild(topBottomPipes[1].visual)
        })
        pipes = []
    }

    function movePipes() {
        pipesMovementTimerId = setInterval(function() {
            pipes.forEach(topBottomPipes => {
                let topPipe = topBottomPipes[0]
                let bottomPipe = topBottomPipes[1]
                let left = topPipe.left - 1
                topPipe.left = left
                topPipe.visual.style.left = left + px
                bottomPipe.left = left
                bottomPipe.visual.style.left = left + px

                //Checking collisions
                if (
                    (bird.top <= topPipe.height || bird.top + birdHeight >= bottomPipe.top) &&
                    (bird.left + birdWidth >= left && bird.left <= left  + pipepWidth)
                ) {
                    gameOver()
                }

                //Checking if the player made a point
                if( bird.left >= left + pipepWidth && !topBottomPipes[0].passedByBird) {
                    score.innerText = parseInt(score.innerText) + 1
                    topBottomPipes[0].passedByBird = true
                    topBottomPipes[1].passedByBird = true
                    birdPointSfx.play()
                }

                //Removing the pipes that have passed the grid                
                if (left == -pipepWidth) {
                    grid.removeChild(pipes[0][0].visual)
                    grid.removeChild(pipes[0][1].visual)
                    pipes.shift()
                }

                if (left == 100) {
                    createPipe(gridWidth)
                }
            })
        }, 9)
    }

    function loadAudio(fileName) {
        let filePath = `./sfxs/${fileName}`
        return new Audio(filePath)
    }

    function loadAudios() {
        birdWingSfx = loadAudio(birdWingSfx)
        birdPointSfx = loadAudio(birdPointSfx)
        birdDieSfx = loadAudio(birdDieSfx)
    }

    function initialMenu() {
        playButton.style.display = 'block'
        controlsButton.style.display = 'block'
    }

    function start() {
        if (isGameOver)
            grid.removeChild(bird.visual)
        else {
            document.addEventListener('keyup', control)
            document.addEventListener('click', control) 
            loadAudios()
        }

        isGameOver = false
        removePipes()
        createPipe(gridWidth)
        createBird()
        moveBirdDown()
        movePipes()
        score.innerText = '0'
        if(score.className != 'undefined'){
            score.classList.add('score')
            grid.appendChild(score)
        }
    }

    function gameOver() {
        birdDieSfx.play()
        isGameOver = true
        clearInterval(birdMovementDownTimerId)
        if (isBirdJumping) {
            clearInterval(birdMovementUpTimerId)
        }
        clearInterval(pipesMovementTimerId)
        initialMenu()
    }

    initialMenu()
});

