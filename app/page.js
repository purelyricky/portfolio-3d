'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import ProjectCard from '../components/ProjectCard';
import TechStack from '../components/TechStack';
import { GitHub, Twitter, Linkedin, Mail } from 'lucide-react';

// GitHub contribution data visualization
const contributionData = [
  // Sample data - in production this would be fetched from GitHub API
  { date: '2023-01-01', count: 5 },
  { date: '2023-01-02', count: 2 },
  { date: '2023-01-03', count: 8 },
  // ... more data points
];

export default function Home() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [activeProject, setActiveProject] = useState(null);
  const [isExploding, setIsExploding] = useState(false);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Three.js setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    
    renderer.setSize(
      containerRef.current.clientWidth, 
      containerRef.current.clientHeight
    );
    
    containerRef.current.appendChild(renderer.domElement);
    
    // Create particles representing your code contributions
    const particlesCount = 5000;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesPositions = new Float32Array(particlesCount * 3);
    const particlesColors = new Float32Array(particlesCount * 3);
    
    // Position particles in a sphere
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      const radius = 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      particlesPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      particlesPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlesPositions[i3 + 2] = radius * Math.cos(phi);
      
      // Map colors to represent different technologies
      const colorIndex = Math.floor(Math.random() * 5);
      const colors = [
        new THREE.Color(0x61dafb), // React blue
        new THREE.Color(0x764abc), // Redux purple
        new THREE.Color(0x339933), // Node green
        new THREE.Color(0xe34c26), // HTML red
        new THREE.Color(0xf7df1e), // JavaScript yellow
      ];
      
      const color = colors[colorIndex];
      particlesColors[i3] = color.r;
      particlesColors[i3 + 1] = color.g;
      particlesColors[i3 + 2] = color.b;
    }
    
    particlesGeometry.setAttribute(
      'position', 
      new THREE.BufferAttribute(particlesPositions, 3)
    );
    
    particlesGeometry.setAttribute(
      'color', 
      new THREE.BufferAttribute(particlesColors, 3)
    );
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Create central sphere representing your profile
    const profileGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const profileMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x444444,
      specular: 0x555555,
      shininess: 30
    });
    
    const profileSphere = new THREE.Mesh(profileGeometry, profileMaterial);
    scene.add(profileSphere);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    // Animation function
    function animate() {
      requestAnimationFrame(animate);
      
      // Rotate particles
      particles.rotation.y += 0.001;
      
      // Animate profile sphere
      profileSphere.rotation.y += 0.005;
      
      renderer.render(scene, camera);
    }
    
    // Explosion effect function
    window.explodeParticles = () => {
      setIsExploding(true);
      
      // Get current positions
      const positions = particlesGeometry.attributes.position.array;
      
      // Animate each particle outward
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        
        // Calculate direction vector from center
        const direction = new THREE.Vector3(x, y, z).normalize();
        
        // Animate position outward
        gsap.to(positions, {
          [i3]: x + direction.x * 5,
          [i3 + 1]: y + direction.y * 5,
          [i3 + 2]: z + direction.z * 5,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            particlesGeometry.attributes.position.needsUpdate = true;
          }
        });
      }
      
      // Return to original positions after delay
      setTimeout(() => {
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          const radius = 2;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          
          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.sin(phi) * Math.sin(theta);
          const z = radius * Math.cos(phi);
          
          gsap.to(positions, {
            [i3]: x,
            [i3 + 1]: y,
            [i3 + 2]: z,
            duration: 2,
            ease: "elastic.out(1, 0.3)",
            onUpdate: () => {
              particlesGeometry.attributes.position.needsUpdate = true;
            },
            onComplete: () => {
              setIsExploding(false);
            }
          });
        }
      }, 3000);
    };
    
    // Start animation
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      
      renderer.setSize(
        containerRef.current.clientWidth, 
        containerRef.current.clientHeight
      );
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);
  
  const projects = [
    {
      id: 1,
      title: "Project Alpha",
      description: "A revolutionary web application using React and Three.js",
      image: "/project-alpha.jpg",
      technologies: ["React", "Three.js", "WebGL"],
      github: "https://github.com/yourusername/project-alpha",
      demo: "https://project-alpha.demo.com"
    },
    {
      id: 2,
      title: "Project Beta",
      description: "Full-stack application with Next.js and GraphQL",
      image: "/project-beta.jpg",
      technologies: ["Next.js", "GraphQL", "MongoDB"],
      github: "https://github.com/yourusername/project-beta",
      demo: "https://project-beta.demo.com"
    },
    {
      id: 3,
      title: "Project Gamma",
      description: "Mobile-first PWA with offline capabilities",
      image: "/project-gamma.jpg",
      technologies: ["React Native", "Redux", "Firebase"],
      github: "https://github.com/yourusername/project-gamma",
      demo: "https://project-gamma.demo.com"
    }
  ];
  
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            YourName.dev
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#about" className="hover:text-blue-400 transition">About</a>
            <a href="#projects" className="hover:text-blue-400 transition">Projects</a>
            <a href="#technologies" className="hover:text-blue-400 transition">Technologies</a>
            <a href="#contact" className="hover:text-blue-400 transition">Contact</a>
          </nav>
          
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-md hover:opacity-90 transition">
            Let's Connect
          </button>
        </div>
      </header>
      
      <main>
        {/* Hero Section with 3D Visualization */}
        <section className="relative h-screen flex items-center">
          <div 
            ref={containerRef} 
            className="absolute inset-0 -z-10"
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-4">
                Coding in <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">3 Dimensions</span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 text-gray-300">
                Full-stack developer crafting immersive digital experiences
              </p>
              
              <div className="flex space-x-4">
                <button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-md hover:opacity-90 transition"
                  onClick={() => window.explodeParticles()}
                  disabled={isExploding}
                >
                  {isExploding ? "Exploding..." : "Explode Particles!"}
                </button>
                
                <a 
                  href="#projects"
                  className="border border-white px-6 py-3 rounded-md hover:bg-white/10 transition"
                >
                  View Projects
                </a>
              </div>
            </div>
          </div>
        </section>
        
        {/* Projects Section */}
        <section id="projects" className="py-24 bg-gradient-to-b from-black to-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-16 text-center">
              Featured <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Projects</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map(project => (
                <ProjectCard 
                  key={project.id}
                  project={project}
                  setActiveProject={setActiveProject}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* 3D Technologies Section */}
        <section id="technologies" className="py-24 bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-16 text-center">
              Technology <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Stack</span>
            </h2>
            
            <TechStack />
          </div>
        </section>
        
        {/* GitHub Contribution Graph */}
        <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-16 text-center">
              GitHub <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Contributions</span>
            </h2>
            
            <div className="bg-black/50 p-8 rounded-xl backdrop-blur-sm">
              <div className="h-64 bg-gradient-to-r from-gray-900 to-black rounded-lg overflow-hidden">
                {/* This would be replaced with an actual GitHub contribution graph visualization */}
                <div className="h-full flex items-center justify-center">
                  <p className="text-center text-gray-400">Interactive GitHub contribution visualization goes here</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section id="contact" className="py-24 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-16 text-center">
              Let's <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Connect</span>
            </h2>
            
            <div className="max-w-2xl mx-auto bg-black/50 p-8 rounded-xl backdrop-blur-sm border border-gray-800">
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                <a href="https://github.com/yourusername" className="flex items-center gap-2 text-gray-300 hover:text-white">
                  <GitHub size={24} />
                  <span>GitHub</span>
                </a>
                <a href="https://twitter.com/yourusername" className="flex items-center gap-2 text-gray-300 hover:text-white">
                  <Twitter size={24} />
                  <span>Twitter</span>
                </a>
                <a href="https://linkedin.com/in/yourusername" className="flex items-center gap-2 text-gray-300 hover:text-white">
                  <Linkedin size={24} />
                  <span>LinkedIn</span>
                </a>
                <a href="mailto:your.email@example.com" className="flex items-center gap-2 text-gray-300 hover:text-white">
                  <Mail size={24} />
                  <span>Email</span>
                </a>
              </div>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Name" 
                    className="bg-black/50 border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    className="bg-black/50 border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Subject" 
                  className="w-full bg-black/50 border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea 
                  placeholder="Message" 
                  rows={5}
                  className="w-full bg-black/50 border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-md hover:opacity-90 transition w-full"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-black py-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} YourName.dev. All rights reserved.
            </p>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="https://github.com/yourusername" className="text-gray-400 hover:text-white">
                <GitHub size={20} />
              </a>
              <a href="https://twitter.com/yourusername" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com/in/yourusername" className="text-gray-400 hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Project Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="max-w-4xl w-full bg-gray-900 rounded-xl overflow-hidden">
            <div className="relative h-72">
              <img 
                src={activeProject.image} 
                alt={activeProject.title}
                className="w-full h-full object-cover"
              />
              <button 
                className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/80"
                onClick={() => setActiveProject(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{activeProject.title}</h3>
              <p className="text-gray-300 mb-4">{activeProject.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {activeProject.technologies.map(tech => (
                  <span key={tech} className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="flex gap-4">
                <a 
                  href={activeProject.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-800 px-4 py-2 rounded-md hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <GitHub size={20} />
                  View Code
                </a>
                <a 
                  href={activeProject.demo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-md hover:opacity-90 transition"
                >
                  Live Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}