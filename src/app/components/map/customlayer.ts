//@ts-nocheck
import * as THREE from 'three';
import { MercatorCoordinate } from 'mapbox-gl';
import { IFCLoader } from 'web-ifc-three/IFCLoader';

export const ifcModels = [];
export const mouse = new THREE.Vector4(-1000, -1000, 1, 1);
export let globalScene = new THREE.Scene();

// const modelOrigin = [28.5120217, 0.0007375];
const modelOrigin = [0, 0];
const modelAltitude = 0;
const modelRotate = [Math.PI / 2, 0, Math.PI / 2];

const modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat(
  modelOrigin,
  modelAltitude
);

const modelTransform = {
  translateX: modelAsMercatorCoordinate.x,
  translateY: modelAsMercatorCoordinate.y,
  translateZ: modelAsMercatorCoordinate.z,
  rotateX: modelRotate[0],
  rotateY: modelRotate[1],
  rotateZ: modelRotate[2],
  scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
};

export const customLayer2 = {
  id: '3d-model',
  type: 'custom',
  renderingMode: '3d',
  results: [],
  newMatrials: new THREE.MeshLambertMaterial({
    transparent: true,
    opacity: 0.6,
    color: 0xff88ff,
    depthTest: false,
  }),

  onAdd: async function (map, gl) {
    const loader = new IFCLoader();
    await loader.ifcManager.setWasmPath('assets/wasm/');

    loader.load(
      'https://game.dornadzor-sz.ru/static/testing/model.ifc',
      (ifc) => {
        this.camera = new THREE.PerspectiveCamera();
        this.scene = globalScene;

        const directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0, -70, 100).normalize();
        this.scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff);
        directionalLight2.position.set(0, 70, 100).normalize();
        this.scene.add(directionalLight2);

        console.log(ifc);
        ifcModels.push(ifc);
        const group = new THREE.Group();
        this.scene.add(group);
        ifc.rotateX(Math.PI / 2);
        // ifc.rotateY(Math.PI);
        window.console.log(ifc);
        // ifc.position.set(
        //   0.44889307022094727,
        //   -1.4999999701976776 - 10,
        //   0.9399831295013428
        // );
        // ifc.position.set(-3271422.5, 0, 6630300);
        // ifc.rotation.x -= Math.PI / 2;
        // ifc.rotation.x += Math.PI / 2;
        // ifc.rotation.x += Math.PI / 2;

        ifc.position.y += 1663000;
        ifc.position.x += -25057.628;
        // ifc.position.x += -5000;
        // 3250000,
        group.add(ifc);
        const box = new THREE.Box3().setFromObject(ifc);
        console.log(box);
        // group.position.set(+32714 + 31739, 66303, 0);
        // group.rotation.x = -Math.PI / 2;
        // group.rotation.y = Math.PI / 2;

        // // group.position.z += 10;
        // var cube = new THREE.Mesh(
        //   new THREE.BoxGeometry(50, 50, 50),
        //   new THREE.MeshNormalMaterial()
        // );
        // // this.scene.add(cube);
        // let cube1 = cube.clone();
        // cube1.material = new THREE.MeshNormalMaterial();
        // cube1.translateX(1000);
        // this.scene.add(cube1);

        this.map = map;
        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true,
        });

        this.renderer.autoClear = false;
        this.raycaster = new THREE.Raycaster();
        this.raycaster.firstHitOnly = true;
        globalScene = this.scene;
      }
    );
  },
  render: async function (gl, matrix) {
    var m = new THREE.Matrix4().fromArray(matrix);
    var l = new THREE.Matrix4()
      .makeTranslation(
        modelTransform.translateX,
        modelTransform.translateY,
        modelTransform.translateZ
      )
      .scale(
        new THREE.Vector3(
          modelTransform.scale,
          -modelTransform.scale,
          modelTransform.scale
        )
      );

    this.camera.projectionMatrix = m.clone().multiply(l);
    this.camera.matrixWorldInverse = new THREE.Matrix4();
    this.renderer.resetState();

    const freeCamera = this.map.getFreeCameraOptions();
    let cameraPosition = new THREE.Vector4(
      freeCamera.position.x,
      freeCamera.position.y,
      freeCamera.position.z,
      1
    );
    cameraPosition.applyMatrix4(l.invert());
    let direction = mouse
      .clone()
      .applyMatrix4(this.camera.projectionMatrix.clone().invert());
    direction.divideScalar(direction.w);
    this.raycaster.set(
      cameraPosition,
      direction.sub(cameraPosition).normalize()
    );

    const intersects = this.raycaster.intersectObjects(this.scene.children);
    // console.log('Intersection count:', intersects.length);
    // window.console.log(intersects);
    this.results = intersects[0];

    this.renderer.render(this.scene, this.camera);

    try {
      if (intersects[0]) {
        const index = intersects[0].faceIndex;
        const geometry = intersects[0].object.geometry;
        const ifc = ifcModels?.[0].ifcManager;
        const id = ifc.getExpressId(geometry, index);
        const modelID = intersects[0].object.modelID;
        await ifc.createSubset({
          modelID,
          ids: [id],
          material: this.newMatrials,
          scene: this.scene,
          customId: id,
          removePrevious: true,
        });

        // window.console.log(ifcModels?.[0].matrix);
        // ifc.createSubset.rotation.x += Math.PI / 2;
        // ifc.createSubset.rotation.y -= Math.PI / 2;
        const subset = Object.values(ifc.subsets.subsets)[0];
        // subset.mesh.rotation.x = ifcModels[0].rotation.x;
        // subset.mesh.rotation.y = ifcModels[0].rotation.y;
        // subset.mesh.rotation.z = ifcModels[0].rotation.z;

        if (ifcModels[0]?.parent.type === 'Group' && false) {
          const group = ifcModels[0]?.parent;

          group.add(subset.mesh);

          subset.mesh.position.x = ifcModels[0].position.x;
          subset.mesh.position.y = ifcModels[0].position.y;
          subset.mesh.position.z = ifcModels[0].position.z;
        } else {
          subset.mesh.rotation.x = ifcModels[0].rotation.x;
          subset.mesh.rotation.y = ifcModels[0].rotation.y;
          subset.mesh.rotation.z = ifcModels[0].rotation.z;

          subset.mesh.position.x = ifcModels[0].position.x;
          subset.mesh.position.y = ifcModels[0].position.y;
          subset.mesh.position.z = ifcModels[0].position.z;
        }

        this.map.triggerRepaint();
        // this.renderer.render(this.scene, this.camera);

        if (id >= 0 && modelID >= 0) {
          const props = await ifc.getItemProperties(modelID, id);
          this.results = { ...this.results, props };
        }
      }
    } catch (e) {
      window.console.log({ e });
      for (let i = 0; i < intersects.length; i++) {
        intersects[i].object.material.wireframe = true;
      }

      for (let i = 0; i < intersects.length; i++) {
        intersects[i].object.material.wireframe = false;
      }
    }
  },
};
