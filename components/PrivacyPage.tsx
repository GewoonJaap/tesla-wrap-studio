
import React from 'react';
import { Shield, Lock, Eye, Server } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-16">
        <div className="container mx-auto px-6 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-medium mb-6">
                <Shield className="w-3 h-3" /> Privacy Policy
            </div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-zinc-400">Last updated: December 28, 2025</p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-3xl py-12 space-y-12">
        
        <div className="prose prose-invert max-w-none">
            <p className="text-zinc-400 text-lg leading-relaxed">
                Your privacy is important to us. It is Tesla Wrap Studio's policy to respect your privacy regarding any information we may collect from you across our website, <span className="text-white font-mono bg-zinc-900 px-1 rounded">https://tesla-wrap.mrproper.dev</span>, and other sites we own and operate.
            </p>
        </div>

        <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg"><Eye className="w-5 h-5 text-blue-400" /></div>
                <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
            </div>
            <div className="space-y-4 text-zinc-400">
                <p>
                    We collect information that you provide directly to us when you:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Create an account (Email address).</li>
                    <li>Upload images or designs to our Gallery.</li>
                    <li>Generate content using our AI tools (Prompts and resulting images).</li>
                    <li>Contact us for support.</li>
                </ul>
                <p>
                    We also automatically collect certain information when you access the Service, such as:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Log data (IP address, browser type, pages visited).</li>
                    <li>Device information.</li>
                    <li>Usage data (Interaction with features like likes and downloads).</li>
                </ul>
            </div>
        </section>

        <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg"><Server className="w-5 h-5 text-purple-400" /></div>
                <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
            </div>
            <p className="text-zinc-400 leading-relaxed">
                We use the information we collect to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>Provide, maintain, and improve our services.</li>
                <li>Process your image generations via the Google Gemini API.</li>
                <li>Host and display your designs in the public gallery (if you choose to publish).</li>
                <li>Authenticate your identity and prevent fraud.</li>
                <li>Respond to your comments and questions.</li>
            </ul>
        </section>

        <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg"><Lock className="w-5 h-5 text-orange-400" /></div>
                <h2 className="text-2xl font-bold text-white">3. Third-Party Services</h2>
            </div>
            <p className="text-zinc-400 leading-relaxed">
                We may share information with third-party service providers that help us operate our Service:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li><strong>Supabase:</strong> For authentication, database management, and file storage.</li>
                <li><strong>Google Gemini API:</strong> For AI-powered texture generation. When you use the AI tools, your prompts and uploaded reference images are sent to Google for processing.</li>
            </ul>
            <p className="text-zinc-400 leading-relaxed mt-4">
                These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4. Cookies</h2>
            <p className="text-zinc-400 leading-relaxed">
                We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service (e.g., logging in).
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Security</h2>
            <p className="text-zinc-400 leading-relaxed">
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">6. Changes to This Privacy Policy</h2>
            <p className="text-zinc-400 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mt-8">
            <h2 className="text-xl font-bold text-white mb-4">7. Contact Us</h2>
            <p className="text-zinc-400 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
            </p>
            <a href="mailto:wrap@mrproper.dev" className="text-purple-400 hover:text-purple-300 font-mono text-lg">
                wrap@mrproper.dev
            </a>
        </section>

      </div>
    </div>
  );
};

export default PrivacyPage;
