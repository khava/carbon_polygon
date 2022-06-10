function init() {
    const container = document.querySelector("#scene");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(37, window.innerWidth/window.innerHeight, 1, 5000);
    camera.position.set(-0.5, 849, 5);
    camera.lookAt(scene.position);
    
    const controls = new THREE.OrbitControls(camera, container);
    controls.minDistance = 300;
    controls.maxDistance = 1500;
    controls.maxPolarAngle = 1;
    // controls.enableRotate = false;
    controls.update();

    const lights = createLights();
    const buttons = createButtons();

    scene.add(
        lights.ambient,
        lights.dirLight,
        ...buttons
    );

    const renderer = createRenderer(container);

    setupOnWindowResize(camera, container, renderer);

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });

    let loader = new THREE.GLTFLoader();
    loader.load('../../static/3d_model/russia.glb', (gltf) => {
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
        mroot.position.y-= (size.y * 0.5);
        scene.add(gltf.scene);

    });

    setupSelectAndZoom(camera, container, buttons, renderer);
};

function animate() {
    requestAnimationFrame(animate);
};

function makeButton(name, x, y, z, rotateY=0) {
    let width = 7;
    let height = 7;

    let texture = new THREE.TextureLoader().load('../../static/img/pin.png');

    let geometry = new THREE.CircleGeometry(width, height);
    geometry.rotateX(30);
    geometry.rotateY(rotateY);

    let material = new THREE.MeshPhongMaterial({
        opacity: 5,
        color: new THREE.Color(0x000000),
        blending: THREE.NoBlending,
        side: THREE.DoubleSide,
        map: texture,
        alphaTest: 0.5
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.name = name;

    return mesh;
};

function createButtons() {
    let buttons = [];

    buttons.push(makeButton('pin1', -390, 10, -105));
    buttons.push(makeButton('pin2', -345, 10, -30));
    buttons.push(makeButton('pin3', -320, 10, -30));
    buttons.push(makeButton('pin4', -410, 10, 80));
    buttons.push(makeButton('pin5', -385, 10, 125));
    buttons.push(makeButton('pin6', -265, 10, 35));
    buttons.push(makeButton('pin7', -180, 10, 50));
    buttons.push(makeButton('pin8', -150, 10, 70));
    buttons.push(makeButton('pin9', -100, 10, 120));
    buttons.push(makeButton('pin10', 360, 10, 125));

    return buttons
};

function createLights() {
    const ambient = new THREE.AmbientLight(0xFFFFFF, 1);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
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

function setupSelectAndZoom(camera, container, buttons, renderer) {
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

        let pinModalElement = document.getElementById('pinModal');
        let pinModal = new bootstrap.Modal(pinModalElement, {
            keyboard: false
        });

        const intersects = raycaster.intersectObjects(buttons);

        if (intersects.length > 0) {
            console.log(intersects[0].object.name)

            pinModalElement.querySelector('.modal-body .btn').style.display = 'none';
            
            if (intersects[0].object.name === 'pin1') {
                replacePlacehoders(carbonPolygonInfo['pin1'], pinModalElement);
                pinModal.show();
            }
            if (intersects[0].object.name === 'pin2') {
                replacePlacehoders(carbonPolygonInfo['pin2'], pinModalElement);
                pinModal.show();
            }
            if (intersects[0].object.name === 'pin3') {
                replacePlacehoders(carbonPolygonInfo['pin3'], pinModalElement);
                pinModal.show();
            }
            if (intersects[0].object.name === 'pin4') {
                replacePlacehoders(carbonPolygonInfo['pin4'], pinModalElement);
                pinModal.show();
            }
            if (intersects[0].object.name === 'pin5') {
                replacePlacehoders(carbonPolygonInfo['pin5'], pinModalElement);
                pinModalElement.querySelector('.modal-body .btn').style.display = 'block';
                pinModal.show();
            }
            if (intersects[0].object.name === 'pin6') {
                replacePlacehoders(carbonPolygonInfo['pin6'], pinModalElement);
                pinModal.show();
            }
            if (intersects[0].object.name === 'pin7') {
                replacePlacehoders(carbonPolygonInfo['pin7'], pinModalElement);
                pinModal.show();
            }
            if (intersects[0].object.name === 'pin8') {
                replacePlacehoders(carbonPolygonInfo['pin8'], pinModalElement);
                pinModal.show();
            }
            if (intersects[0].object.name === 'pin9') {
                replacePlacehoders(carbonPolygonInfo['pin9'], pinModalElement);
                pinModal.show();
            }
            if (intersects[0].object.name === 'pin10') {
                replacePlacehoders(carbonPolygonInfo['pin10'], pinModalElement);
                pinModal.show();
            }
        }

    }, false);
};

function replacePlacehoders(object, htmlElement) {
    htmlElement.querySelector('.title').innerHTML = object['title'];
    htmlElement.querySelector('.location').innerHTML = object['location'];
    htmlElement.querySelector('.operator span').innerHTML = object['operator'];
    htmlElement.querySelector('.type span').innerHTML = object['type'];
    htmlElement.querySelector('.size span').innerHTML = object['size'];
    htmlElement.querySelector('.number-plots span').innerHTML = object['numberPlots'];
    htmlElement.querySelector('.industrial-partner span').innerHTML = object['industrialPartner'];
}
