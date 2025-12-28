
import React from 'react';
import { Usb, FolderOpen, Car, AlertTriangle, CheckCircle2, FileImage, HardDrive } from 'lucide-react';

const GuidePage: React.FC = () => {
  // SEO: Structured Data for Google "How-to" rich results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Install Custom Wraps in Tesla Paint Shop",
    "description": "Step-by-step guide to installing custom wrap textures and license plate backgrounds on Tesla Model 3, Model Y, and Cybertruck via USB.",
    "totalTime": "PT5M",
    "supply": [
      { "@type": "HowToSupply", "name": "USB Drive (Flash Drive)" },
      { "@type": "HowToSupply", "name": "Custom Wrap PNG File" }
    ],
    "tool": [
      { "@type": "HowToTool", "name": "Computer" },
      { "@type": "HowToTool", "name": "Tesla Vehicle (Toybox)" }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "Format USB Drive",
        "text": "Format your USB drive to exFAT or MS-DOS FAT (FAT32). Ensure it does not contain TeslaCam folders.",
        "image": "https://tesla-wrap.mrproper.dev/images/guide-usb.jpg"
      },
      {
        "@type": "HowToStep",
        "name": "Create Folder Structure",
        "text": "Create a folder named 'Wraps' (case-sensitive) on the root of the drive.",
        "image": "https://tesla-wrap.mrproper.dev/images/guide-folder.jpg"
      },
      {
        "@type": "HowToStep",
        "name": "Transfer File",
        "text": "Copy your exported .png design file into the 'Wraps' folder.",
        "image": "https://tesla-wrap.mrproper.dev/images/guide-copy.jpg"
      },
      {
        "@type": "HowToStep",
        "name": "Install in Vehicle",
        "text": "Plug the USB into the Tesla glovebox port. Navigate to Toybox > Paint Shop > Wraps and select your file.",
        "image": "https://tesla-wrap.mrproper.dev/images/guide-install.jpg"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Hero Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-16">
        <div className="container mx-auto px-6 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-6">
                <Usb className="w-3 h-3" /> Updated for 2025 Holiday Update
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-6">How to Install Custom Tesla Wraps</h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                A complete step-by-step guide to adding custom textures and license plates to your Cybertruck, Model 3, or Model Y using a USB drive.
            </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-4xl py-12 space-y-16">
        
        {/* Step 1: USB Prep */}
        <section className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-zinc-800 hidden md:block" />
            
            <div className="flex flex-col md:flex-row gap-8 mb-12 relative">
                <div className="hidden md:flex w-16 h-16 bg-zinc-900 border-2 border-zinc-700 rounded-full items-center justify-center shrink-0 z-10 text-xl font-bold">1</div>
                <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <HardDrive className="w-6 h-6 text-blue-500" />
                        <h2 className="text-2xl font-bold">Prepare Your USB Drive</h2>
                    </div>
                    <p className="text-zinc-400 mb-6">
                        You can use a standard USB flash drive. For best results, use a separate drive from your Sentry Mode/Dashcam drive to avoid conflict.
                    </p>
                    <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                            <div>
                                <strong className="block text-white">Format correctly</strong>
                                <p className="text-sm text-zinc-500">The drive must be formatted as <span className="text-white bg-zinc-800 px-1 rounded">exFAT</span> or <span className="text-white bg-zinc-800 px-1 rounded">FAT32</span> (MS-DOS FAT).</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                            <div>
                                <strong className="block text-white">No Special Partitions</strong>
                                <p className="text-sm text-zinc-500">Do not partition the drive. Tesla currently does not support NTFS for media loading.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 2: Folder Structure */}
            <div className="flex flex-col md:flex-row gap-8 mb-12 relative">
                <div className="hidden md:flex w-16 h-16 bg-zinc-900 border-2 border-zinc-700 rounded-full items-center justify-center shrink-0 z-10 text-xl font-bold">2</div>
                <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <FolderOpen className="w-6 h-6 text-purple-500" />
                        <h2 className="text-2xl font-bold">Create the Folders</h2>
                    </div>
                    <p className="text-zinc-400 mb-6">
                        The Tesla Paint Shop looks for specific folder names. These are <strong>case-sensitive</strong>.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2"><Car className="w-4 h-4" /> For Body Wraps</h3>
                            <div className="font-mono text-sm bg-zinc-900 p-3 rounded border border-zinc-700 text-zinc-300">
                                USB_DRIVE/<br/>
                                └── <span className="text-green-400 font-bold">Wraps</span>/
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">Create a folder named exactly "Wraps".</p>
                        </div>

                        <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2"><FileImage className="w-4 h-4" /> For License Plates</h3>
                            <div className="font-mono text-sm bg-zinc-900 p-3 rounded border border-zinc-700 text-zinc-300">
                                USB_DRIVE/<br/>
                                └── <span className="text-green-400 font-bold">LicensePlate</span>/
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">Create a folder named exactly "LicensePlate".</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 3: Transfer Files */}
            <div className="flex flex-col md:flex-row gap-8 mb-12 relative">
                <div className="hidden md:flex w-16 h-16 bg-zinc-900 border-2 border-zinc-700 rounded-full items-center justify-center shrink-0 z-10 text-xl font-bold">3</div>
                <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <FileImage className="w-6 h-6 text-orange-500" />
                        <h2 className="text-2xl font-bold">Add Your Design Files</h2>
                    </div>
                    <p className="text-zinc-400 mb-6">
                        Move the .png files you downloaded from our <strong>Tesla Wrap Studio</strong> into the corresponding folders.
                    </p>
                    <div className="space-y-3 text-sm text-zinc-400 bg-zinc-950 p-4 rounded-lg">
                        <p>✅ Ensure the file extension is <strong>.png</strong></p>
                        <p>✅ Ensure file size is under <strong>1MB</strong> (Our tool handles this automatically)</p>
                        <p>✅ Use simple names like <code>CarbonFiber.png</code> or <code>MatteBlack.png</code></p>
                    </div>
                </div>
            </div>

            {/* Step 4: Installation */}
            <div className="flex flex-col md:flex-row gap-8 relative">
                <div className="hidden md:flex w-16 h-16 bg-zinc-900 border-2 border-zinc-700 rounded-full items-center justify-center shrink-0 z-10 text-xl font-bold">4</div>
                <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Car className="w-6 h-6 text-red-500" />
                        <h2 className="text-2xl font-bold">Apply in Vehicle</h2>
                    </div>
                    <p className="text-zinc-400 mb-6">
                        Sit in your Tesla and plug the USB drive into the glovebox USB port (or center console for older models).
                    </p>
                    
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-white font-bold text-lg mb-2">To Apply Wraps & License Plates:</h3>
                            <div className="flex flex-wrap gap-2 text-sm text-zinc-300">
                                <span className="px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">Toybox</span>
                                <span>&rarr;</span>
                                <span className="px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">Paint Shop</span>
                                <span>&rarr;</span>
                                <span className="px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">Wraps / License Plate</span>
                            </div>
                            <p className="text-zinc-500 text-sm mt-2">Wait a few seconds for the USB icon to appear. Select the "Wraps" or "License Plate" tab depending on what you want to customize.</p>
                        </div>
                    </div>
                </div>
            </div>

        </section>

      </div>
    </div>
  );
};

export default GuidePage;
