
import React from 'react';
import { Palette, Code2, Cpu } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      
      {/* Hero */}
      <div className="relative overflow-hidden py-20 border-b border-zinc-800">
         <div className="absolute inset-0 bg-purple-900/10"></div>
         <div className="container mx-auto px-6 relative z-10 max-w-4xl text-center">
            <h1 className="text-5xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                About Tesla Wrap Studio
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed">
                The world's most advanced <strong>free Tesla wrap creator</strong>. We empower owners to visualize, design, and download unique vehicle skins using web technology and generative AI.
            </p>
         </div>
      </div>

      <div className="container mx-auto px-6 max-w-4xl py-16 space-y-20">
          
          {/* Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                  <h2 className="text-3xl font-bold mb-4 text-white">Our Mission</h2>
                  <p className="text-zinc-400 leading-relaxed mb-4">
                      Tesla vehicles are marvels of engineering, but they often look identical on the road. The <strong>Tesla Holiday Update 2025</strong> opened the door for digital customization, but creating these textures requires complex image editing skills.
                  </p>
                  <p className="text-zinc-400 leading-relaxed">
                      We built <strong>Tesla Wrap Studio</strong> to democratize design. Whether you are a professional <strong>wrap designer</strong> or just want a neon-green Cybertruck, our tools make it possible in seconds.
                  </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Palette className="w-12 h-12 text-purple-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Creative Freedom</h3>
                  <p className="text-zinc-500">
                      From solid matte colors to complex AI-generated patterns, the only limit is your imagination. The ultimate <strong>DIY Tesla wrap</strong> solution.
                  </p>
              </div>
          </div>

          {/* Technology */}
          <div>
              <h2 className="text-3xl font-bold mb-8 text-center">Powered By Technology</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-900 transition-colors">
                      <Cpu className="w-8 h-8 text-blue-400 mb-4" />
                      <h3 className="text-lg font-bold mb-2">Google Gemini AI</h3>
                      <p className="text-sm text-zinc-500">
                          Utilizing the latest Gemini 2.5 and 3.0 Pro models to generate photorealistic textures from simple text prompts.
                      </p>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-900 transition-colors">
                      <Code2 className="w-8 h-8 text-green-400 mb-4" />
                      <h3 className="text-lg font-bold mb-2">React & Three.js</h3>
                      <p className="text-sm text-zinc-500">
                          Built with a high-performance React frontend and Three.js for real-time 3D mapping and previews directly in the browser.
                      </p>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-900 transition-colors">
                      <Palette className="w-8 h-8 text-orange-400 mb-4" />
                      <h3 className="text-lg font-bold mb-2">Supabase</h3>
                      <p className="text-sm text-zinc-500">
                          Secure cloud storage and database management allows the community to share, remix, and like designs globally.
                      </p>
                  </div>
              </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center">
              <h2 className="text-xl font-bold mb-4">Disclaimer</h2>
              <p className="text-zinc-500 text-sm max-w-2xl mx-auto">
                  Tesla Wrap Studio is an independent fan project and is not affiliated with, endorsed by, or connected to Tesla, Inc. 
                  "Tesla", "Model 3", "Model Y", and "Cybertruck" are trademarks of Tesla, Inc.
              </p>
          </div>

      </div>
    </div>
  );
};

export default AboutPage;
