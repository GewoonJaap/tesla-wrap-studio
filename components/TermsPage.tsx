
import React from 'react';
import { Shield, FileText } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-16">
        <div className="container mx-auto px-6 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-6">
                <FileText className="w-3 h-3" /> Legal Information
            </div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-zinc-400">Last updated: December 28, 2025</p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-3xl py-12 space-y-12">
        
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
            <p className="text-zinc-400 leading-relaxed">
                By accessing and using Tesla Wrap Studio ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">2. Use License</h2>
            <p className="text-zinc-400 leading-relaxed">
                Permission is granted to temporarily access the materials on Tesla Wrap Studio for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>Modify or copy the materials;</li>
                <li>Use the materials for any commercial purpose or for any public display;</li>
                <li>Attempt to reverse engineer any software contained on the website;</li>
                <li>Remove any copyright or other proprietary notations from the materials;</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">3. User Accounts</h2>
            <p className="text-zinc-400 leading-relaxed">
                To access certain features of the Service, you may be required to create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>Maintaining the confidentiality of your account credentials;</li>
                <li>All activities that occur under your account;</li>
                <li>Providing accurate and complete information when creating your account;</li>
                <li>Notifying us immediately of any unauthorized use of your account.</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4. User Content</h2>
            
            <h3 className="text-xl font-semibold text-white mt-6">4.1 Submission of Content</h3>
            <p className="text-zinc-400 leading-relaxed">
                By submitting designs, images, comments, or other content ("User Content") to the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content for the purpose of operating and promoting the Service.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">4.2 Content Guidelines</h3>
            <p className="text-zinc-400 leading-relaxed">
                You agree not to submit content that:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>Is illegal, harmful, or violates any laws;</li>
                <li>Infringes on intellectual property rights of others;</li>
                <li>Contains hate speech, harassment, or discriminatory content;</li>
                <li>Is spam, misleading, or fraudulent;</li>
                <li>Contains viruses or malicious code;</li>
                <li>Violates the privacy rights of others.</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">4.3 Content Moderation</h3>
            <p className="text-zinc-400 leading-relaxed">
                We reserve the right to remove, edit, or refuse to publish any User Content that violates these Terms or that we determine, in our sole discretion, is objectionable or harmful.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Intellectual Property</h2>
            <p className="text-zinc-400 leading-relaxed">
                The Service and its original content, features, and functionality are owned by Tesla Wrap Studio and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">6. Prohibited Uses</h2>
            <p className="text-zinc-400 leading-relaxed">
                You may not use the Service:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>In any way that violates any applicable law or regulation;</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material;</li>
                <li>To impersonate or attempt to impersonate the company, employees, or other users;</li>
                <li>In any way that infringes upon the rights of others;</li>
                <li>To engage in any other conduct that restricts or inhibits anyone's use of the Service.</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">7. Termination</h2>
            <p className="text-zinc-400 leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">8. Disclaimer</h2>
            <p className="text-zinc-400 leading-relaxed">
                The materials on Tesla Wrap Studio are provided on an 'as is' basis. Tesla Wrap Studio makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">9. Limitations</h2>
            <p className="text-zinc-400 leading-relaxed">
                In no event shall Tesla Wrap Studio or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Tesla Wrap Studio, even if Tesla Wrap Studio or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">10. Revisions</h2>
            <p className="text-zinc-400 leading-relaxed">
                Tesla Wrap Studio may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">11. Governing Law</h2>
            <p className="text-zinc-400 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with applicable laws, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mt-8">
            <h2 className="text-xl font-bold text-white mb-4">12. Contact Information</h2>
            <p className="text-zinc-400 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
            </p>
            <a href="mailto:wrap@mrproper.dev" className="text-purple-400 hover:text-purple-300 font-mono text-lg">
                wrap@mrproper.dev
            </a>
        </section>

      </div>
    </div>
  );
};

export default TermsPage;
