// VARS ########################################################################################
class Turret {
    constructor (color) {
        this.DOM = '';
        this.x = 0; //left
        this.y = 0; //top
        this.size = 50; //px
        this.angle = 0; //rad
        this.color = color; //rgb or string?
    }
    setPosition (x,y) { // requires DOM
        this.DOM.style.top = `${y-this.size/2}px`; this.y = y;
        this.DOM.style.left = `${x-this.size/2}px`; this.x = x;
    }
    setAngle (angle) {
        this.DOM.style.transform = `rotate(${angle-Math.PI/4}rad)`; this.angle = angle;   
    }
    startDOM () {
        let newTurret = document.createElement ('div'); 
        newTurret.classList.add ('turret'); 
        newTurret.classList.add (`${this.color}TurretClass`);
        document.body.appendChild(newTurret); 
        this.DOM = newTurret; 
        let newTail = document.createElement ('div');
        newTail.classList.add ('tail');
        newTail.classList.add (`${this.color}TailClass`);
        this.DOM.appendChild(newTail);
        // this.setPosition (200,200); // remove later <===========
    }
}

class Bullet {
    constructor (color) {
        this.DOM = '';
        this.x = 0; //left
        this.y = 0; //top
        this.size = 30; //px
        this.color = color; //string
        this.speed = 0;
        this.vec = [];
    }
    setPosition (x,y) { // requires DOM
        this.DOM.style.top = `${y-this.size/2}px`; this.y = y;
        this.DOM.style.left = `${x-this.size/2}px`; this.x = x;
    }
    move (vec) {
        let mod = (vec[0]**2 + vec[1]**2)**(0.5); let uni = [(vec[0]/mod),(vec[1]/mod)]; 
        this.setPosition(this.x + uni[0]*this.speed, this.y - uni[1]*this.speed);
    }
    startDOM (x,y) {
        let newBullet = document.createElement ('div'); 
        newBullet.classList.add ('bullet'); 
        newBullet.classList.add ('tail'); 
        newBullet.classList.add (`${this.color}TailClass`);
        stage.appendChild(newBullet); 
        this.DOM = newBullet; 
        this.speed = 15;
        this.setPosition(x,y);
    }
    destroyDOM () {
        this.DOM.className = '';
        this.setPosition(0,0);
        this.speed = 0;
    }
}

class Enemy {
    constructor (color) {
        this.DOM = '';
        this.x = 0; //left
        this.y = 0; //top
        this.size = [24, 16]; //px
        this.color = color; //string
        this.speed = 0;
        this.vec = [];
        this.angle = 0; //rad
    }
    setPosition (x,y) { // requires DOM
        this.DOM.style.top = `${y-this.size[1]/2}px`; this.y = y;
        this.DOM.style.left = `${x-this.size[0]/2}px`; this.x = x;
    }
    setAngle (angle) {
        this.DOM.style.transform = `rotate(${angle}rad)`; this.angle = angle;   
    }
    move (vec) {
        let mod = (vec[0]**2 + vec[1]**2)**(0.5); let uni = [(vec[0]/mod),(vec[1]/mod)]; 
        this.setPosition(this.x + uni[0]*this.speed, this.y - uni[1]*this.speed);
    }
    startDOM (x,y) {
        let newEnemy = document.createElement ('div'); 
        newEnemy.classList.add ('enemy'); 
        newEnemy.classList.add (`${this.color}EnemyClass`);
        stage.appendChild(newEnemy); 
        this.DOM = newEnemy; 
        this.speed = 3;
        this.setPosition(x,y);
        this.vec = vecTo (x, y, mS.x, mS.y);
        this.setAngle (-angTo (this.vec));
    }
    destroyDOM () {
        this.DOM.className = '';
        this.setPosition(0,0);
        this.speed = 0;
    }
}


//cursor div
let cursor = {
    DOM: document.getElementById ('cursor'),
    size: 30,
    x: 0,
    y: 0,
    setPosition (x,y) {
        this.DOM.style.top = (y-this.size/2)+'px'; this.y = y;
        this.DOM.style.left = (x-this.size/2)+'px'; this.x = x;
    }
}

// screen center
let mS = {x: window.innerWidth / 2, y: window.innerHeight / 2};
// mouse element 
let mouse = {x: 0, y: 0};
// turrets
let turrets = [];
let turretsAngs = [-(2*Math.PI)/3, 0, (2*Math.PI)/3];
// bullets
let bullets = [];
let turretSelected = ''; // bullets color selected to be shooted
// stage
let stage = document.getElementById ('stage');
// scene
let scene = {
    t: 0, // time
    start: false,
    activated: false,
}
// enemies
let enemies = [];

// FUNCTIONS ########################################################################################
let PosFromAng = (ang,r) => {
    let x = r*Math.cos(ang); 
    let y = r*Math.sin(ang);
    x = mS.x + x; 
    y = mS.y + y;
    return [x,y];
}

let createTurret = (color, ang) => {
    let newTurret = new Turret (color);
    newTurret.startDOM ();
    let newPos = PosFromAng (ang, 275);
    newTurret.setPosition(newPos[0],newPos[1]);
    return newTurret;
}

let enemyRandPos = (r) => {
    let factor = Math.floor((Math.random() * 100) + 1);
    let ang = (Math.PI*2*factor)/100; // rad
    return [Math.cos (ang)*r + mS.x, Math.sin (ang)*r + mS.y];
}

// check if element is on given radio
let inRad = (cenX, cenY, x, y, r) => {return ((cenX - x)*(cenX - x) + (cenY - y)*(cenY - y) < r*r) ? true : false;}

// get vector from a to b
let vecTo = (fromX, fromY, toX, toY) => {return [toX - fromX, fromY - toY];} // a list <==

// get angle given vector
let angTo = (vector) => {
    if (vector [0] > 0 && vector [1] > 0) {
        // 1 quad + +
        return Math.atan(vector[1]/vector[0]);
    } else if (vector [0] < 0 && vector [1] > 0) {
        // 2 quad - +
        return Math.PI + Math.atan(vector[1]/vector[0]);
    } else if (vector [0] < 0 && vector [1] < 0) {
        // 3 quad - - 
        return Math.PI + Math.atan(vector[1]/vector[0]);
    } else {
        // 4 cuad + -
        return Math.PI*2 + Math.atan(vector[1]/vector[0]);
    }
}; // returns - angles in radians

// EVENTS ########################################################################################

document.addEventListener ('keyup', (event) => {
    // create 3 turrets when pressing p
    if (event.code == 'KeyP' && scene.start == false && scene.activated == false) {
        scene.start = true;
        scene.activated = true;
        // cyan
        let cyanTurret = createTurret('cyan', turretsAngs[0])
        // magenta
        let magentaTurret = createTurret ('magenta', turretsAngs[1]);
        // yellow
        let yellowTurret = createTurret ('yellow', turretsAngs[2]);
        // all
        turrets = [cyanTurret, magentaTurret, yellowTurret];
    } else if (event.code == 'KeyQ' || event.code == 'KeyW' || event.code == 'KeyE' || event.code == 'KeyR') {
        turretSelected = '';
    }
})

document.addEventListener ('keydown', (event) => {
    if (event.code == 'KeyQ') { 
        turretSelected = turrets[0];
    } else if (event.code == 'KeyW') {
        turretSelected = turrets[1];
    } else if (event.code == 'KeyE') {
        turretSelected = turrets[2];
    } else if (event.code == 'KeyR') {
        turretSelected = turrets;
    }
})

// adjust turrets position when resize
window.addEventListener ('resize', (event) => {
    mS = {x: window.innerWidth / 2, y: window.innerHeight / 2};
    for (let i = 0; i < 3; i++) {
        let iPos = PosFromAng (turretsAngs[i], 275);
        turrets[i].setPosition(iPos[0], iPos[1]);
    }
})

// get mouse position
document.addEventListener('mousemove', (event) => {mouse.x = event.clientX; mouse.y = event.clientY;})

// shoot a bullet (test)
document.addEventListener ('click', (event) => {
    if (turretSelected == turrets[0] || turretSelected == turrets[1] || turretSelected == turrets[2]) {
        let newBullet = new Bullet (turretSelected.color);
        newBullet.startDOM (turretSelected.x,turretSelected.y);
        newBullet.vec = vecTo (turretSelected.x,turretSelected.y, mouse.x, mouse.y);
    bullets.push (newBullet); // replace with queryselector all "bullets" to avoid collapse
    } else if (turretSelected == turrets) {
        for (let i = 0; i < 3; i++) {
            let newBullet = new Bullet (turrets[i].color);
            newBullet.startDOM (turrets[i].x,turrets[i].y);
            newBullet.vec = vecTo (turrets[i].x,turrets[i].y, mouse.x, mouse.y);
            bullets.push (newBullet); // replace with queryselector all "bullets" to avoid collapse
        }
    }
})

// main clock
setInterval (() => {
    // time control
    scene.t++;
    // mouse control
    cursor.setPosition (mouse.x, mouse.y);
    // turrets angle control
    if (turrets.length > 0) {
        for (let i = 0; i < 3; i++) {
            turrets[i].setAngle(-angTo(vecTo(turrets[i].x,turrets[i].y,mouse.x,mouse.y)));
        }
    }
    // if game has started <===============
    if (scene.start == true) {
        // move bullets
        if (bullets.length > 0) {
            for (let i = 0; i < bullets.length; i++) {
                if (inRad(mS.x, mS.y, bullets[i].x, bullets[i].y, 277)) {
                    bullets[i].move(bullets[i].vec)
                } else {
                    bullets[i].destroyDOM();
                }
            }
        }
        // generate enemies
        if (scene.t % 40 == 0) { // 1 per 2 seconds
            let eF = Math.floor((Math.random() * 100) + 1);
            let eC = '';
            if (eF < 33) { // cyan
                eC = 'cyan';
            } else if (33 < eF && eF < 66) {
                eC = 'magenta';
            } else {
                eC = 'yellow';
            }
            let newEnemy = new Enemy (eC);
            let eRP = enemyRandPos (275);
            newEnemy.startDOM (eRP[0], eRP[1]);
            enemies.push (newEnemy);
        }
        // control enemies
        if (enemies.length > 0) {
            for (let i = 0; i < enemies.length; i++) {
                if (inRad (mS.x, mS.y, enemies[i].x, enemies[i].y, 277) && inRad (mS.x, mS.y, enemies[i].x, enemies[i].y, 30) == false) {
                    enemies[i].move (enemies[i].vec);
                } else {
                    enemies[i].destroyDOM();
                }
            }
        }
    }
}, 25)