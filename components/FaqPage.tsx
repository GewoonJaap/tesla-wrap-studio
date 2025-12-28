
import React from 'react';
import { HelpCircle, FileQuestion, HardDrive, AlertTriangle, Sparkles } from 'lucide-react';

const FaqPage: React.FC = () => {
  // JSON-LD Structured Data for FAQPage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How to add custom wraps to Tesla Paint Shop?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To add a custom wrap, download or create a design using our tool. Save the .png file to a folder named 'Wraps' on a USB drive. Plug the drive into your Tesla, go to Toybox > Paint Shop > Wraps, and select your file."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I download free Tesla wraps?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can download free custom Tesla wraps from our Community Gallery. We host thousands of designs for Cybertruck, Model 3, and Model Y that are ready to import into your vehicle."
        }
      },
      {
        "@type": "Question",
        "name": "Is this compatible with the Holiday Update 2025?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Our Tesla wrap creator creates files fully compatible with the 2025 Holiday Update Paint Shop features (Colorizer 2.0). All exports are optimized to meet the 1MB file size limit."
        }
      },
      {
        "@type": "Question",
        "name": "What format does the USB drive need to be for Tesla wraps?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The USB drive should be formatted as exFAT or FAT32. Ensure the drive does not contain TeslaCam or Firmware update folders that might interfere with the media player reading the 'Wraps' folder."
        }
      },
      {
        "@type": "Question",
        "name": "Why is my custom wrap not showing up in the car?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ensure the folder name is exactly 'Wraps' (case-sensitive) with a capital 'W'. The file must be a .png image under 1MB. If using a Mac, ensure hidden dotfiles are not confusing the system."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <div className="bg-zinc-900 border-b border-zinc-800 py-16">
        <div className="container mx-auto px-6 max-w-4xl text-center">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-zinc-400 text-lg">Everything you need to know about designing, downloading, and installing custom Tesla wraps.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-3xl py-12 space-y-8">
        
        {/* Section 0: Holiday Update 2025 */}
        <div className="bg-gradient-to-br from-purple-900/20 to-zinc-900 border border-purple-500/30 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold">Holiday Update 2025 Support</h2>
            </div>
            
            <div className="space-y-6">
                 <div>
                    <h3 className="font-bold text-lg mb-2 text-zinc-100">Is this tool compatible with the new update?</h3>
                    <p className="text-zinc-400 leading-relaxed">
                        Absolutely. The custom wraps/skins feature was officially expanded in the <strong>December 2025 Holiday Update</strong>. 
                        Our <strong>Tesla wrap creator</strong> ensures all exported files are perfectly optimized (1MB limit, correct aspect ratio) for the new Paint Shop system.
                    </p>
                </div>
            </div>
        </div>

        {/* Section 1 */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                    <HelpCircle className="w-6 h-6 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold">General Usage</h2>
            </div>
            
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-lg mb-2 text-zinc-100">Is this wrap designer free?</h3>
                    <p className="text-zinc-400 leading-relaxed">Yes, the Tesla Wrap Studio is a completely <strong>free tesla wrap maker</strong>. You can design, save, and download unlimited wraps without any cost. Some advanced AI generation features require your own Gemini API key.</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-2 text-zinc-100">Which models are supported?</h3>
                    <p className="text-zinc-400 leading-relaxed">We provide custom templates for the Cybertruck, Model 3 (Highland, 2024, Base), and Model Y (2025, Performance, Long Range). We also support custom License Plate backgrounds.</p>
                </div>
            </div>
        </div>

        {/* Section 2 */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                    <HardDrive className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold">Installation Guide</h2>
            </div>
            
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-lg mb-2 text-zinc-100">How to add custom wraps to Tesla Paint Shop?</h3>
                    <ol className="list-decimal list-inside space-y-2 text-zinc-400 marker:text-zinc-500">
                        <li>Format your USB drive to <strong>exFAT</strong> or <strong>FAT32</strong>.</li>
                        <li>Create a folder named <code>Wraps</code> (case-sensitive).</li>
                        <li>Download your design and place the .png file into this folder.</li>
                        <li>Plug the USB into the glovebox port of your Tesla.</li>
                        <li>Navigate to <strong>Toybox &rarr; Paint Shop &rarr; Wraps</strong>.</li>
                    </ol>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-2 text-zinc-100">File Requirements</h3>
                    <ul className="list-disc list-inside space-y-2 text-zinc-400 marker:text-zinc-500">
                        <li><strong>Format:</strong> .png only</li>
                        <li><strong>Size:</strong> Under 1MB per file (Our downloader handles this automatically)</li>
                        <li><strong>Dimensions:</strong> Between 512x512 and 1024x1024 px</li>
                        <li><strong>Filename:</strong> Simple letters and numbers, no special characters.</li>
                    </ul>
                </div>
            </div>
        </div>

        {/* Section 3 */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold">Troubleshooting</h2>
            </div>
            
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-lg mb-2 text-zinc-100">My wrap looks distorted.</h3>
                    <p className="text-zinc-400 leading-relaxed">The Tesla software maps the square image onto the 3D car model. Use the "3D Preview" button in our <strong>Tesla wrap studio</strong> to see how your texture will wrap around the curves of the vehicle before exporting.</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-2 text-zinc-100">"No custom wraps found" error.</h3>
                    <p className="text-zinc-400 leading-relaxed">This usually happens if the folder name is wrong. It must be <code>Wraps</code> with a capital W. Also, ensure you aren't using an NTFS formatted drive.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default FaqPage;
