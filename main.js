// 
// IMPORTS 
// 
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//
//Sound Effects
//
const bgAudio = document.getElementById('bgAudio');
bgAudio.volume = 0.2;
bgAudio.play();
const outAudio = document.getElementById('outAudio');
const jumpAudio = document.getElementById('jumpAudio');
jumpAudio.volume = 0.5;
const rewardAudio = document.getElementById('rewardAudio');
rewardAudio.volume = 0.5;
//
//Model
//
let gltfLoader = new GLTFLoader();
let sleighModel;
gltfLoader.load('./assets/models/sleigh-v1.glb', (gltf) => {
    sleighModel = gltf.scene;
    gltf.scene.scale.set(0.2,0.2,0.2);
    gltf.scene.position.z = 48;
    gltf.scene.position.y = -0.5;
    gltf.scene.rotation.y = -Math.PI/2;
    player.material.transparent = true;
    player.material.opacity = 0;
    player.material.needsUpdate = true;
   scene.add(gltf.scene);
})

// 
// TEXTURES 
// 
let textureLoader = new THREE.TextureLoader();

let particleTexture = textureLoader.load('./assets/images/star_01.png');
// let gltfLoader = new GLTFLoader();


// gltfLoader.load('./assets/images/tree.glb', (gltf) => {
//     let tree = gltf.scene;

    
//     tree.scale.set(0.8, 0.8, 0.8); 

    
//     tree.position.set(0, -1, 0); /

//     scene.add(tree);
   
// });

// 
// UTILS 
// 
let sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}
let aspectRatio = sizes.width / sizes.height;
const canvas = document.querySelector('canvas.webgl');

// 
// SCENE 
// 
const scene = new THREE.Scene();
scene.background = new THREE.Color("#050f26");
// 
// OBJECTS 
// 


//
//Sand
//
let playgroundLength = 110;
let playgroundBreadth = 20;

let makeSand = () => {
    const sand = new THREE.Mesh(
        new THREE.PlaneGeometry(
            playgroundBreadth+100,
            playgroundLength+20,
            30,
            30
        ),
        new THREE.MeshStandardMaterial({
            color: 0xEDC9AF,
            flatShading:true,
            wireframe:false
            
        })
    )
    sand.rotation.x = -Math.PI/2;
    sand.position.y = -1;

    let array = sand.geometry.attributes.position.array;
    for(let i = 2;i<array.length;i+=3){
        array[i] = Math.random()/3;
    }
    return sand;
}

let sandMesh = makeSand();
scene.add(sandMesh);
//trees
let trunkComputeBoxArr = [];
let trunkMeshArr = [];
let makeTrunkComputeBox = (trunk) => {
    const box = new THREE.Box3();
    const helper = new THREE.Box3Helper( box, 'red' );
    //scene.add( helper );

    trunk.geometry.computeBoundingBox();
    box.copy( trunk.geometry.boundingBox ).applyMatrix4( trunk.matrixWorld );
    trunkComputeBoxArr.push(box);
}

let makeOneTree = () => {
    let colors = ['#008000','#228B22','#006400'];
    let tree = new THREE.Group();
    let r=1;
    for(let i = 0;i<3;i++){
        let color = colors[i];
        let leaves = new THREE.Mesh(
            new THREE.ConeGeometry(r,1,32),
            new THREE.MeshStandardMaterial({color})
        )
        leaves.position.y=i*0.5;
        tree.add(leaves);
        r -= 0.25;
    }
    let trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2,0.2,1,10),
        new THREE.MeshStandardMaterial({color:'#3A271A'})
    )
    trunk.position.y -= 0.5;
   
     makeTrunkComputeBox(trunk);
     trunkMeshArr.push(trunk);

    tree.add(trunk);
    return tree;


}


//trees
let makeTrees = (treeNum) => {
    let trees = new THREE.Group();
    for(let i =0;i<treeNum;i++){
        let tree = makeOneTree();
        tree.position.set(
            (Math.random() * playgroundBreadth)/2
             * (i % 2 == 0?-1:1),
            0,
            (Math.random()* playgroundLength)/2 
            *(Math.floor(Math.random() * 10) % 2 == 0 ? 1:-1)
        )
        tree.rotation.x = (Math.random()/3)*(i % 2 == 0 ? -1:1);
        trees.add(tree);
    }
    return trees;
}
//
//Rewards
//
let rewardComputeBoxArr =[];
let rewardMeshArr = [];

let makeRewardComputeBox = (reward) => {
    const box = new THREE.Box3();
    const helper = new THREE.Box3Helper( box, 'red' );
   // scene.add( helper );

    reward.geometry.computeBoundingBox();
    box.copy( reward.geometry.boundingBox ).applyMatrix4( reward.matrixWorld );
    rewardComputeBoxArr.push(box);
}

let makeRewards = (rewardsNum) => {
    let colors = [
        "#F47C7C",
        "#F7F48B",
        "#A1DE93",
        "#70A1D7",
        "#C56E90",
        "#9D8CB8",
    ]
    let rewards = new THREE.Group();
    for(let i =0;i<rewardsNum;i++){
        let reward = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.2,0),
            new THREE.MeshStandardMaterial({color:colors[i % colors.length]})
        )
        reward.position.set(
            (Math.random() * playgroundBreadth)/2
             * (i % 2 == 0?-1:1),
            -0.5,
            (Math.random()* playgroundLength)/2 
            *(Math.floor(Math.random() * 10) % 2 == 0 ? 1:-1)
        )
        reward.rotation.x = (Math.random()/3)*(i % 2 == 0 ? -1:1);

        let scaleRandom = Math.random();
        scaleRandom = scaleRandom < 0.2 ? 1 : scaleRandom;
        reward.scale.set(scaleRandom,scaleRandom,scaleRandom);

        makeRewardComputeBox(reward);
        rewardMeshArr.push(reward);
        rewards.add(reward);
    }
    return rewards;
}

//mountains
let makeBgMountains = () => {
    let mountainGeometry = new THREE.IcosahedronGeometry(70,0);
    let mountainMaterial = new THREE.MeshStandardMaterial({
        color:'grey',
        flatShading:true
    })
    let mountain1 = new THREE.Mesh(mountainGeometry,mountainMaterial);
    mountain1.position.set(-100,-40,-100);
    let mountain2 = new THREE.Mesh(mountainGeometry,mountainMaterial);
    mountain2.position.set(0,0,-100);
    let mountain3 = new THREE.Mesh(mountainGeometry,mountainMaterial);
    mountain3.position.set(100,-20,-100);
    
    mountain1.rotation.x = Math.random()*Math.PI;
    mountain2.rotation.y = Math.random()*Math.PI;
    mountain3.rotation.z = Math.random()*Math.PI;

    let mountains = new THREE.Group();
    mountains.add(mountain1,mountain2,mountain3);
    return mountains;
}


//moon
let makeMoon = () => {
    let moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(2,30,30),
        new THREE.MeshStandardMaterial({color:'white'})
    )
    moonMesh.position.set(-23,17,0);
    return moonMesh;
}

//clouds
let makeCloudsMesh = () => {
    let cloudsMesh = new THREE.Group();
    let cloudPositions = [
        { x: -15, y: 10, z: 0 },
        { x: -15, y: 10, z: 15 },
        { x: 5, y: 8, z: 40 },
        { x: 15, y: 10, z: 0 }
    ]

    for (let j = 0; j < 4; j++) {
        let cloud = new THREE.Group();

        let cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        let cubeMaterial = new THREE.MeshBasicMaterial();

        for (let i = 0; i < 8; i++) {
            let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cubeMesh.rotation.x = (Math.random() * Math.PI) / 2;
            cubeMesh.rotation.y = (Math.random() * Math.PI) / 2;
            cubeMesh.rotation.z = (Math.random() * Math.PI) / 2;

            cubeMesh.position.x += i - Math.random() * 0.1;

            let scaleRandom = Math.random();
            cubeMesh.scale.set(scaleRandom, scaleRandom, scaleRandom);

            cloud.add(cubeMesh)
        }

        cloud.position.set(cloudPositions[j].x, cloudPositions[j].y, cloudPositions[j].z);

        cloudsMesh.add(cloud);
    }

    return cloudsMesh;
}

//Particles
let makeParticles = (count) => {
    let bgParticlesGeometry = new THREE.BufferGeometry();
    let positions = new Float32Array(count * 3);

    for(let i =0;i<count*3;i++){
        positions[i] = (Math.random() - 0.5)*25;
    }
    bgParticlesGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions,3)
    )
    let bgParticlesMaterials = new THREE.PointsMaterial();
    bgParticlesMaterials.size = 0.2;
    bgParticlesMaterials.transparent=true;
    bgParticlesMaterials.alphaMap = particleTexture;
    bgParticlesMaterials.sizeAttenuation = true;
    bgParticlesMaterials.depthWrite = false;

    let bgParticles = new THREE.Points(bgParticlesGeometry,bgParticlesMaterials)
    return bgParticles;
}

//Player
let makePlayer = () => {
    let cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.5,0.3,0.7),
        new THREE.MeshStandardMaterial({
            color:'red'
        })
    )
    cube.position.z = 48;
    cube.position.y = -0.5;
    
    playerBox = new THREE.Box3();
    const helper = new THREE.Box3Helper( playerBox, 'red' );
   // scene.add( helper );


    cube.geometry.computeBoundingBox();
    playerBox.copy(cube.geometry.boundingBox).applyMatrix4(cube.matrixWorld);

    return cube;
}
let playerBox;
let player = makePlayer();
scene.add(player);


//STATIC
let particles = makeParticles(1500);
particles.position.z=51;
let mountains = makeBgMountains();
let moon = makeMoon();
scene.add(particles,mountains,moon)

let treeNum=25;

let sandPlaneMesh1 = makeSand();
let trees1 = makeTrees(treeNum);
let clouds1 = makeCloudsMesh();
let playGround1 = new THREE.Group();
let rewards1 = makeRewards(25);
playGround1.add(sandPlaneMesh1,trees1,clouds1,rewards1);
scene.add(playGround1);

let sandPlaneMesh2 = makeSand();
let trees2 = makeTrees(treeNum);
let clouds2 = makeCloudsMesh();
let playGround2 = new THREE.Group();
let rewards2 = makeRewards(25);
playGround2.add(sandPlaneMesh2,trees2,clouds2,rewards2);
playGround2.position.z -= playgroundLength;
scene.add(playGround2);

let sandPlaneMesh3 = makeSand();
let trees3 = makeTrees(treeNum);
let clouds3 = makeCloudsMesh();
let playGround3 = new THREE.Group();
let rewards3 = makeRewards(25);
playGround3.add(sandPlaneMesh3,trees3,clouds3,rewards3);
playGround3.position.z -= playgroundLength * 2;
scene.add(playGround3);

// 
// LIGHTS 
// 
let ambientLight = new THREE.AmbientLight('grey', 1.5);
scene.add(ambientLight);

let directionalLight = new THREE.DirectionalLight('white', 4);
directionalLight.position.z = 7;
directionalLight.position.y = 4;
scene.add(directionalLight);


function isMobileDevice(){
    return /Mobi|android/i.test(navigator.userAgent);
}
let fov = 55;
if(isMobileDevice()){
    fov = 60;
}
// 
// CAMERA 
// 
let camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 1000);
camera.position.z = 50.5;
camera.position.y = 0.2;

scene.add(camera);
if(isMobileDevice()){
    camera.position.z = 52.25;
}

// 
// RENDERER 
// 
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

// 
// CONTROLS 
// // 
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;

// 
// RESIZE HANDLE 
// 
window.addEventListener('resize', () => {
    sizes.height = window.innerHeight;
    sizes.width = window.innerWidth;

    renderer.setSize(sizes.width, sizes.height);
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
})

let randomizeTrees = (playground) => {
    let treeArr = playground.children[1].children;
    let i =0;
    treeArr.forEach(tree => {
        tree.position.set(
            (Math.random() * playgroundBreadth)/2
             * (i % 2 == 0?-1:1),
            0,
            (Math.random()* playgroundLength)/2 
            *(Math.floor(Math.random() * 10) % 2 == 0 ? 1:-1)
        )
        tree.rotation.x = (Math.random()/3)*(i % 2 == 0 ? -1:1);
        i++;
    })

    }


let regenerateGround = () => {
    if(playGround1.position.z > playgroundLength){
        playGround1.position.z = -playgroundLength*2;
        randomizeTrees(playGround1);
    }
    else if(playGround2.position.z > playgroundLength){
        playGround2.position.z = -playgroundLength*2;
        randomizeTrees(playGround2);
    }
    else if(playGround3.position.z > playgroundLength){
        playGround3.position.z = -playgroundLength*2;
        randomizeTrees(playGround3);
    }
}
//
//Controls player animation
//
let handlePlayer = () => {
    if(playerTargetX > player.position.x + 0.02){
        player.position.x += 0.02;
    }
    else if(playerTargetX < player.position.x - 0.02){
        player.position.x -= 0.02;
    }
    if(playerJump){
        playerJump = false;
        jumpTweenActive = true;
        gsap.to(
            player.position,{y:1,ease:'none',duration:0.28}
        )
        gsap.to(
            player.position,{y:-0.5,ease:'none',duration:0.28,delay:0.28,
                onComplete:()=> {jumpTweenActive = false;}
            }
        )
    }
}
//
//update compute boxes
//

let updateBoundingBoxes = () => {
    playerBox.copy(player.geometry.boundingBox).applyMatrix4(player.matrixWorld);
    for(let i =0;i<trunkComputeBoxArr.length;i++){
        trunkComputeBoxArr[i]
        .copy( trunkMeshArr[i].geometry.boundingBox )
        .applyMatrix4( trunkMeshArr[i].matrixWorld );
    }
    for(let i =0;i<rewardComputeBoxArr.length;i++){
        rewardComputeBoxArr[i]
        .copy( rewardMeshArr[i].geometry.boundingBox )
        .applyMatrix4( rewardMeshArr[i].matrixWorld );
    }

}

let gameStarts = false;
let currScore = 0;
let maxScore = 0;
let level =1;
let levelSpeeed = 15;

setInterval(() => {
    level += 1;
    levelSpeeed +=5;
     document.getElementById('level-container').innerHTML = `<div>Level ${level}</div>`
    console.log('Level:',level)
},20*1000)



//
//MENU
//
document.querySelector('.menu-container').addEventListener('click',() => {
    document.querySelector('.menu-container').style.display = 'none';
    bgAudio.play();
    setTimeout(() => {
        gameStarts = true;
    },2000)
})

let reset = () => {
    //console.log('Current MAX Score:',maxScore);
    if(currScore > maxScore){
        maxScore = Math.floor(currScore);
        document.getElementById('max-score').innerHTML = `Max score : <span> ${Math.floor(maxScore)} </span>`
       // console.log('CONGRATS U BEAT THE MAX SCORE');
        //console.log('New Max Score:',maxScore);
    }
   currScore=0;
   level = 1;
   levelSpeeed=15;
   document.getElementById('curr-score').innerHTML = `Curr score : <span> ${Math.floor(currScore)} </span>`
    player.position.set(0,-0.5,48);
    
    gameStarts = false;

    document.querySelector('.menu-container').style.display = 'flex';

    
    playGround1.position.z = 0;
    playGround2.position.z = -playgroundLength * 1;
    playGround3.position.z =  -playgroundLength * 2;

    randomizeTrees(playGround1)
    randomizeTrees(playGround2)
    randomizeTrees(playGround3)
}

let checkCollision = () => {
    
    for(let i =0;i<trunkComputeBoxArr.length;i++){
        if(playerBox.intersectsBox(trunkComputeBoxArr[i])){
            //console.log('intersected')
            //console.log('Curr Score:',Math.floor(currScore));
            outAudio.play();
            reset();
        }
    }
    for(let i =0;i<rewardComputeBoxArr.length;i++){
        if(playerBox.intersectsBox(rewardComputeBoxArr[i])){
           rewardAudio.play();
            currScore += 5;
            
        }
    }
}

// 
// ANIMATION 
// 
let clock = new THREE.Clock();
let oldElapsedTime = 0;
let animation = () => {
    let elapsedTime = clock.getElapsedTime();
    let deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    playGround1.position.z += deltaTime*levelSpeeed;
    playGround2.position.z += deltaTime*levelSpeeed;
    playGround3.position.z += deltaTime*levelSpeeed;
    regenerateGround();

    if(sleighModel){
        sleighModel.rotation.x = Math.sin(elapsedTime) / 5;
        sleighModel.position.copy(player.position);
    }
    handlePlayer();
    updateBoundingBoxes();
    if(gameStarts){
        currScore += 0.05;
        document.getElementById('curr-score').innerHTML = `Curr score : <span> ${Math.floor(currScore)} </span>`
    checkCollision();
    }
    particles.rotation.x = -1 * elapsedTime*0.25;
    //controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animation);
}

// User Controls
let playerTargetX = 0;
let playerJump = false;
let jumpTweenActive = false;

let handleKeyDown = (keyEvent) => {
    if(keyEvent.keyCode == 37){
        //console.log('move LEFT');
        if(playerTargetX == 0 ){
            playerTargetX = -1;
        }else if(playerTargetX == 1){
            playerTargetX =0;
        }
    } else if(keyEvent.keyCode == 39){
        //console.log('move RIGHT');
       
        if(playerTargetX == 0 ){
            playerTargetX = 1;
        }else if(playerTargetX == -1){
            playerTargetX =0;
        }
    } else if(keyEvent.keyCode == 38){
        if(!playerJump && !jumpTweenActive){
        //console.log('JUMP');
        jumpAudio.currentTime =0;
        jumpAudio.play();
        playerJump = true;
        }
    }
}
document.onkeydown = handleKeyDown;
//
//SWIPE GESTURES
//
 document.addEventListener('touchstart',handleTouchStart,false);
 document.addEventListener('touchMove',handleTouchMove,false);

let xDown = null;
let yDown = null;

function handleTouchStart(event){
    xDown = event.touches[0].clientX;
    yDown = event.touches[0].clientY;
    //console.log('TOUCH DOWN',event.touches[0].clientX,event.touches[0].clientY);
}
function handleTouchMove(event){
    if(!xDown || !yDown){
        return;
    }
    let xUp = event.touches[0].clientX;
    let yUp = event.touches[0].clientY;

    let xDiff = xDown- xUp;
    let yDiff = yDown - yUp;

    if(Math.abs(xDiff) > Math.abs(yDiff)){
        if(xDiff > 0){
            //console.log('LEFT SWIPE');
            handleSwipe('left');
        }
        else{
          //  console.log('RIGHT SWIPE');
            handleSwipe('right');
        }
    }
    else{
        if(yDiff > 0){
            //console.log('UP SWIPE')
            handleSwipe('up');
        }
        else{
          //  console.log('DOWN SWIPE');
        }
    }

    //console.log('TOUCH UP',event.touches[0].clientX,event.touches[0].clientY);
}

let handleSwipe = (gesture) => {
    if(gesture == 'left'){
        //console.log('move LEFT');
        if(playerTargetX == 0 ){
            playerTargetX = -1;
        }else if(playerTargetX == 1){
            playerTargetX =0;
        }

    }
    else if(gesture == 'right'){
        //console.log('move RIGHT');
       
        if(playerTargetX == 0 ){
            playerTargetX = 1;
        }else if(playerTargetX == -1){
            playerTargetX =0;
        }

    }
    else if(gesture == 'up'){
        if(!playerJump && !jumpTweenActive){
            //console.log('JUMP');
            jumpAudio.currentTime =0;
            jumpAudio.play();
            playerJump = true;
            }

    }
}

animation()