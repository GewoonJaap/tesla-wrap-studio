
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
        "name": "How do I install a custom wrap on my Tesla?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To install a custom wrap, export your design as a PNG. Save it to a USB drive in a folder named 'Wraps'. Plug the USB into your Tesla, go to Toybox > Paint Shop > Wraps, and select your custom file."
        }
      },
      {
        "@type": "Question",
        "name": "Is this tool compatible with the December 2025 Holiday Update?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! This Tesla wrap maker creates files fully compatible with the 2025 Holiday Update Paint Shop features (Colorizer 2.0). Simply export your design and plug it in."
        }
      },
      {
        "@type": "Question",
        "name": "What format does the USB drive need to be?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The USB drive should be formatted as exFAT, FAT32, MS-DOS FAT, ext3, or ext4. NTFS is currently not supported for the Colorizer feature."
        }
      },
      {
        "@type": "Question",
        "name": "Why is my custom wrap not showing up in the car?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ensure the folder name is exactly 'Wraps' (case-sensitive). The file must be a .png under 1MB in size. Also, ensure the USB drive does not contain TeslaCam or Firmware update folders that might interfere."
        }
      },
      {
        "@type": "Question",
        "name": "Can I customize my license plate background?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Select 'License Plate' in the model selector. Design your plate, export it, and save it to a folder named 'LicensePlate' on your USB drive."
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
            <p className="text-zinc-400 text-lg">Everything you need to know about designing and installing custom Tesla wraps using our free creator tool.</p>
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
                    <h3 className="font-bold text-lg mb-2 text-zinc-100">Is this compatible with the new update?</h3>
                    <p className="text-zinc-400 leading-relaxed">
                        Absolutely. The custom wraps/skins feature was officially expanded in the <strong>December 2025 Holiday Update</strong>. 
                        Our <strong>Tesla wrap maker</strong> ensures all exported files are perfectly optimized (1MB limit, correct aspect ratio) for the new Paint Shop system.
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
                    <p className="text-zinc-400 leading-relaxed">Yes, the Tesla Wrap Studio is a completely <strong>free tesla wrap maker</strong>. You can design, save, and export unlimited wraps without any cost. Some advanced AI generation features require your own Gemini API key.</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-2 text-zinc-100">Which models are supported?</h3>
                    <p className="text-zinc-400 leading-relaxed">We are the leading <strong>wrap creator</strong> for the Cybertruck, Model 3 (Highland, 2024, Base), and Model Y (2025, Performance, Long Range). We also support custom License Plate backgrounds.</p>
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
                    <h3 className="font-bold text-lg mb-2 text-zinc-100">How to install via USB?</h3>
                    <ol className="list-decimal list-inside space-y-2 text-zinc-400 marker:text-zinc-500">
                        <li>Format your USB drive to <strong>exFAT</strong> or <strong>FAT32</strong>.</li>
                        <li>Create a folder named <code>Wraps</code> (case-sensitive).</li>
                        <li>Place your exported .png files into this folder.</li>
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
