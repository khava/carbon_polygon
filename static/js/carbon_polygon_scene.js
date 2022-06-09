let animator1, animator2, animator3, animator4, animator5;
let clock = new THREE.Clock();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 10000);

function init() {
    const container = document.querySelector("#scene");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    camera.position.set(-82, 68, 76);
    camera.lookAt(scene.position);
    
    const controls = new THREE.OrbitControls(camera, container);
    controls.maxDistance = 250
    controls.maxPolarAngle = 1.2;
    controls.update();

    const lights = createLights();
    const buttons = createButtons();

    const buttonsMesh = buttons.map((item => {
        return item.mesh
    }));

    [animator1, animator2, animator3, animator4, animator5] = buttons.map((item => {
        return item.animator
    }));

    scene.add(
        lights.ambient,
        lights.dirLight,
        ...buttonsMesh
    );

    const renderer = createRenderer(container);

    setupOnWindowResize(camera, container, renderer);

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });

    let loader = new THREE.GLTFLoader();
    loader.load('../../static/3d_model/carbon.glb', (gltf) => {
        let mroot = gltf.scene;
        let bbox = new THREE.Box3().setFromObject(mroot);
        let cent = bbox.getCenter(new THREE.Vector3());
        let size = bbox.getSize(new THREE.Vector3());

        // Rescale the object to normalized space
        let maxAxis = Math.max(size.x, size.y, size.z);
        mroot.scale.multiplyScalar(900.0 / maxAxis);
        bbox.setFromObject(mroot);
        bbox.getCenter(cent);
        bbox.getSize(size);

        //Reposition to 0,halfY,0
        mroot.position.copy(cent).multiplyScalar(-1);
        console.log(mroot.position.y, size.y, size.y * 0.09)
        mroot.position.y = 0;
        scene.add(gltf.scene);

    });

    setupSelectAndZoom(camera, container, controls, buttonsMesh, renderer);
};

function animate() {
    requestAnimationFrame(animate);
    let delta = clock.getDelta(); 
    animator1.update(300 * delta);
    animator2.update(300 * delta);
    animator3.update(300 * delta);
    animator4.update(300 * delta);
    animator5.update(300 * delta);

};

function makeButton(name, x, y, z, rotateY=0) {
    let width = 7;
    let height = 7;

    let texture = new THREE.TextureLoader().load('../../static/img/dot.png');
    let animator = new TextureAnimator(texture, 8, 1, 8, 75);

    let geometry = new THREE.CircleGeometry(width, height);
    geometry.rotateX(30);
    geometry.rotateY(rotateY);

    let material = new THREE.MeshPhongMaterial({
        opacity: 5,
        // color: new THREE.Color(0xFF0000),
        blending: THREE.NoBlending,
        side: THREE.DoubleSide,
        map: texture,
        alphaTest: 0.5
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.name = name;

    return {'animator': animator, 'mesh': mesh};
};

function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {	
        
    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    this.numberOfTiles = numTiles;

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
    texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

    this.tileDisplayDuration = tileDispDuration;
    this.currentDisplayTime = 0;
    this.currentTile = 0;
        
    this.update = function(milliSec) {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration) {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;
            if (this.currentTile == this.numberOfTiles)
                this.currentTile = 0;

            let currentColumn = this.currentTile % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            let currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
            texture.offset.y = currentRow / this.tilesVertical;
        }
    };
}	

function createButtons() {
    let buttons = [];

    buttons.push(makeButton('button1', 0, -10, -21));
    buttons.push(makeButton('button2', 15, -7, -35));
    buttons.push(makeButton('button3', 17, -10, 22));
    buttons.push(makeButton('button4', -15, -10, -8));
    buttons.push(makeButton('button5', -12, -10, 21));

    return buttons
};

function createLights() {
    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.8);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    dirLight.position.set(10, 4000, 100);

    return {ambient, dirLight};
};

function createRenderer(container) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMappingExposure = 2;
    container.appendChild(renderer.domElement);

    return renderer;
};

function setupOnWindowResize(camera, container, renderer) {
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

init();
animate();

function setupSelectAndZoom(camera, container, controls, buttons, renderer) {
    const selection = [];

    let isDragging = false;
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    container.addEventListener("mousedown", () => { isDragging = false; }, false);
    container.addEventListener("mousemove", () => { isDragging = true; }, false);

    window.addEventListener("mouseup", (event) => {
        if (isDragging) {
            isDragging = false;
            return;
        }

        isDragging = false;

        let rect = renderer.domElement.getBoundingClientRect();

        mouse.x = ((event.clientX - rect.left) / (rect.width - rect.left)) * 2 - 1;
        mouse.y = - ((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        let webglButtonModalElement = document.getElementById('webglButtonModal');
        let webglButtonModal = new bootstrap.Modal(webglButtonModalElement, {
            keyboard: false
        });


        const intersects = raycaster.intersectObjects(buttons);

        if (intersects.length > 0) {
            console.log(intersects[0].object.name)
            
            if (intersects[0].object.name === 'button1') {
                webglButtonModalElement.querySelector('.modal-body iframe').src = '../../static/webgl/button1/index.html';
                webglButtonModal.show();
            }
            if (intersects[0].object.name === 'button2') {
                webglButtonModalElement.querySelector('.modal-body iframe').src = '../../static/webgl/button2/index.html';
                webglButtonModal.show();
            }
            if (intersects[0].object.name === 'button3') {
                webglButtonModalElement.querySelector('.modal-body iframe').src = '../../static/webgl/button3/index.html';
                webglButtonModal.show();
            }
            if (intersects[0].object.name === 'button4') {
                webglButtonModalElement.querySelector('.modal-body iframe').src = '../../static/webgl/button4/index.html';
                webglButtonModal.show();
            }
            if (intersects[0].object.name === 'button5') {
                webglButtonModalElement.querySelector('.modal-body iframe').src = '../../static/webgl/button5/index.html';
                webglButtonModal.show();
            }

        }

    }, false);
};
