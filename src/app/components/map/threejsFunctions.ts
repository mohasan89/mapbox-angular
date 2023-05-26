//@ts-nocheck
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader';
import { IFCLoader } from 'web-ifc-three/IFCLoader';

import { MercatorCoordinate } from 'mapbox-gl';

import { line as linePoints } from './linepoints';
import { IFCSLAB } from 'web-ifc';
import { Raycaster, Vector2 } from 'three';
const raycaster = new Raycaster();
raycaster.firstHitOnly = true;
const mouse = new Vector2();
let globalMap: any = null;
let globalL: any = null;

export const ifcModels = [];

import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from 'three-mesh-bvh';

import * as turf from '@turf/turf';

const point = turf.toWgs84(
  turf.point([
    (3321341.1959000001661479 + 3317279.5632000002078712) / 2 - 300,
    (8099335.3567000003531575 + 8076938.9012000001966953) / 2 - 300,
  ])
);

window.console.log(
  turf.toWgs84(turf.point([94829.26171875, -129456.55078125]))
);

const modelOrigin = [28.245807599017397, 59.37864028030037];
// const modelOrigin = [0, 0];
// const modelOrigin = [
//   point.geometry.coordinates[0],
//   point.geometry.coordinates[1],
// ];
const modelAltitude = 0;
const modelRotate = [Math.PI / 2, 0, 0];

const modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat(
  modelOrigin,
  modelAltitude
);

export function pick(event) {
  // console.log(event);
  const found = cast(event)[0];
  window.console.log({ found });
  // if (found) {
  //   const index = found.faceIndex;
  //   const geometry = found.object.geometry;
  //   const ifc = loader.ifcManager;
  //   const id = ifc.getExpressId(geometry, index);
  //   console.log(id);
  //   ifcModel = ifc;
  // }
}

const modelTransform = {
  translateX: modelAsMercatorCoordinate.x,
  translateY: modelAsMercatorCoordinate.y,
  translateZ: modelAsMercatorCoordinate.z,
  rotateX: modelRotate[0],
  rotateY: modelRotate[1],
  rotateZ: modelRotate[2],
  scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * 10,
};

console.log(modelAsMercatorCoordinate.meterInMercatorCoordinateUnits());

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera();

function cast(event) {
  const div = window.document.getElementById('map');
  const bounds = div.getBoundingClientRect();
  // raycaster.setFromCamera(mouse, camera);
  const x1 = event.originalEvent.clientX - bounds.left;
  const x2 = bounds.right - bounds.left;
  mouse.x = (x1 / x2) * 2 - 1;

  const y1 = event.originalEvent.clientY - bounds.top;
  const y2 = bounds.bottom - bounds.top;
  mouse.y = -(y1 / y2) * 2 + 1;

  // const camInverseProjection = new THREE.Matrix4().invert(
  //   camera.projectionMatrix
  // );
  // const cameraPosition = new THREE.Vector3().applyMatrix4(camInverseProjection);
  // const mousePosition = new THREE.Vector3(mouse.x, mouse.y, 1).applyMatrix4(
  //   camInverseProjection
  // );
  // const viewDirection = mousePosition.clone().sub(cameraPosition).normalize();
  // raycaster.set(cameraPosition, viewDirection);
  // return raycaster.intersectObjects(ifcModels);

  const freeCamera = globalMap.getFreeCameraOptions();
  let cameraPosition = new THREE.Vector4(
    freeCamera.position.x,
    freeCamera.position.y,
    freeCamera.position.z,
    1
  );
  cameraPosition.applyMatrix4(globalL.invert());
  let direction = new THREE.Vector4(mouse.x, mouse.y, 1, 1).applyMatrix4(
    camera.projectionMatrix.clone().invert()
  );
  // direction.divideScalar(``);
  // window.console.log(direction);
  raycaster.set(cameraPosition, direction.sub(cameraPosition).normalize());
  return [];
}

export const customLayer = {
  id: '3d-model',
  type: 'custom',
  renderingMode: '3d',
  onAdd: function (map, gl) {
    this.camera = camera;
    this.scene = scene;
    globalMap = map;

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, -70, 100).normalize();
    this.scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff);
    directionalLight2.position.set(0, 70, 100).normalize();
    this.scene.add(directionalLight2);

    // // use the three.js GLTF loader to add the 3D model to the three.js scene
    // const loader = new GLTFLoader();
    // loader.load(
    //   'https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf',
    //   (gltf) => {
    //     this.scene.add(gltf.scene);
    //   }
    // );

    // const sphere = new THREE.SphereGeometry(6000, 30, 30);
    // const matrial = new THREE.MeshLambertMaterial({
    //   color: 'red',
    //   transparent: true,
    // });
    // const mesh = new THREE.Mesh(sphere, matrial);
    // this.scene.add(mesh);

    // 3317279.5632000002078712, : 3321341.1959000001661479,

    // const loader = new FBXLoader();
    // loader.load('/assets/model.fbx', (fbx) => {
    //   this.scene.add(fbx);
    // });

    const loader = new IFCLoader();
    console.log(new Date(Date.now()));
    loader.ifcManager.setWasmPath('assets/wasm/');

    loader.load('/assets/test.ifc', (ifc) => {
      ifcModels.push(ifc);
      ifc.position.set(-129456.55078125, 0, +94829.26171875);
      this.scene.add(ifc);

      const box = new THREE.BoxGeometry(10, 10, 10);

      const material = new THREE.MeshLambertMaterial({ color: 0xff00ff });
      const mesh = new THREE.Mesh(box, material);
      scene.add(mesh);

      this.map = map;
      this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true,
      });
      this.renderer.autoClear = false;
    });

    // const ground = new THREE.PlaneGeometry(
    //   3321341.1959000001661479 - 3317279.5632000002078712,
    //   8099335.3567000003531575 - 8076938.9012000001966953,
    //   600,
    //   600
    // );
    // const disMap = new THREE.TextureLoader()
    //   .setPath('/assets/')
    //   .load('new6.png');

    // const groudMat = new THREE.MeshStandardMaterial({
    //   //   color: 0x000000,
    //   wireframe: true,
    //   displacementMap: disMap,
    //   displacementScale: 10,
    //   //   map: disMap,
    //   normalMap: disMap,
    // });

    // const material = new THREE.LineBasicMaterial({
    //   color: 0x0000ff,
    //   linewidth: 10,
    // });
    // const material2 = new THREE.MeshLambertMaterial({ color: 0xff00ff });
    // const points = [];
    // for (const line of linePoints) {
    //   let pointLine = turf.toMercator(turf.point([line[2], line[3]]));

    //   points.push(
    //     new THREE.Vector3(
    //       pointLine.geometry.coordinates[0] -
    //         (3321341.1959000001661479 + 3317279.5632000002078712) / 2,
    //       pointLine.geometry.coordinates[1] -
    //         (8099335.3567000003531575 + 8076938.9012000001966953) / 2,
    //       line[4] / 2.52
    //     )
    //   );
    // }

    // const sphere = new THREE.SphereGeometry(100, 30, 30);
    // const smesh = new THREE.Mesh(sphere, material2);
    // // this.scene.add(smesh);

    // const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // const mesh = new THREE.Line(geometry, material);
    // // this.scene.add(mesh);

    // const groudMat = new THREE.ShaderMaterial({
    //   uniforms: {
    //     bumpTexture: { value: disMap },
    //     bumpScale: { value: 100 },
    //   },
    //   vertexShader: document.getElementById('vetrexShader')?.textContent,
    //   fragmentShader: document.getElementById('fragmentShader')?.textContent,
    // });

    // const groundMesh = new THREE.Mesh(ground, groudMat);
    // // this.scene.add(groundMesh);

    // this.map = map;

    // this.renderer = new THREE.WebGLRenderer({
    //   canvas: map.getCanvas(),
    //   context: gl,
    //   antialias: true,
    // });
    // this.renderer.autoClear = false;
  },
  render: function (gl, matrix) {
    const rotationX = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(1, 0, 0),
      modelTransform.rotateX
    );
    const rotationY = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 1, 0),
      modelTransform.rotateY
    );
    const rotationZ = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 0, 1),
      modelTransform.rotateZ
    );
    const m = new THREE.Matrix4().fromArray(matrix);
    const l = new THREE.Matrix4()
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
      )
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ);

    this.camera.projectionMatrix = m.multiply(l);
    globalL = l;
    this.renderer.resetState();

    this.renderer.render(this.scene, this.camera);
    this.map.triggerRepaint();
  },
};
