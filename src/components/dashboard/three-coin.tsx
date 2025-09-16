'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeCoin: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(100, 100);
    currentMount.appendChild(renderer.domElement);

    // Coin
    const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
    
    // Create a canvas for the texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (context) {
        context.fillStyle = '#FFD700'; // Gold color
        context.fillRect(0, 0, 256, 256);
        context.font = 'bold 200px PT Sans';
        context.fillStyle = '#B8860B'; // Darker gold for symbol
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('$', 128, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const sideMaterial = new THREE.MeshStandardMaterial({ color: '#DAA520' }); // Lighter gold for the side
    const faceMaterial = new THREE.MeshStandardMaterial({ map: texture });
    
    const materials = [
        sideMaterial,
        faceMaterial,
        faceMaterial,
    ];

    const coin = new THREE.Mesh(geometry, materials);
    scene.add(coin);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      coin.rotation.y += 0.02;
      coin.rotation.x += 0.005;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100px', height: '100px' }} />;
};

export default ThreeCoin;
