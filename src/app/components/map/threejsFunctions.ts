//@ts-nocheck
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { MercatorCoordinate } from 'mapbox-gl';

import * as turf from '@turf/turf';

const point = turf.toWgs84(
  turf.point([
    (3321341.1959000001661479 + 3317279.5632000002078712) / 2 + 500,
    (8099335.3567000003531575 + 8076938.9012000001966953) / 2 + 6000,
  ])
);

const modelOrigin = [30.3351, 59.9343];
// const modelOrigin = [
//   point.geometry.coordinates[0],
//   point.geometry.coordinates[1],
// ];
const modelAltitude = 0;
const modelRotate = [0, 0, 0];

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

export const customLayer = {
  id: '3d-model',
  type: 'custom',
  renderingMode: '3d',
  onAdd: function (map, gl) {
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();

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

    const loader = new FBXLoader();
    loader.load('/assets/model.fbx', (fbx) => {
      this.scene.add(fbx);
    });

    const ground = new THREE.PlaneGeometry(
      3321341.1959000001661479 - 3317279.5632000002078712,
      8099335.3567000003531575 - 8076938.9012000001966953,
      400,
      400
    );
    const disMap = new THREE.TextureLoader()
      .setPath('/assets/')
      .load('new2.png');

    // const groudMat = new THREE.MeshStandardMaterial({
    //   //   color: 0x000000,
    //   wireframe: true,
    //   displacementMap: disMap,
    //   displacementScale: 10,
    //   //   map: disMap,
    //   normalMap: disMap,
    // });

    const groudMat = new THREE.ShaderMaterial({
      uniforms: {
        bumpTexture: { value: disMap },
        bumpScale: { value: 100 },
      },
      vertexShader: document.getElementById('vetrexShader')?.textContent,
      fragmentShader: document.getElementById('fragmentShader')?.textContent,
    });

    const groundMesh = new THREE.Mesh(ground, groudMat);
    // this.scene.add(groundMesh);

    this.map = map;

    // use the Mapbox GL JS map canvas for three.js
    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
    });
    this.renderer.autoClear = false;
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
    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);
    this.map.triggerRepaint();
  },
};
