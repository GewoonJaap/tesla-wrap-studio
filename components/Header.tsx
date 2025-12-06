import React from 'react';
import { CarModel } from '../types';
import { CAR_MODELS } from '../constants';
import { Car, ChevronDown, Download } from 'lucide-react';

interface HeaderProps {
  selectedModel: CarModel;
  onSelectModel: (model: CarModel) => void;
  onDownload: () => void;
}

const Header: React.FC<HeaderProps> = ({ selectedModel, onSelectModel, onDownload }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 z-50 shrink-0">
      <div className="flex items-center gap-3">
        <div className="bg-red-600 p-2 rounded-lg">
          <Car className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 hidden sm:block">
          Tesla Wrap Studio
        </h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-full transition-all border border-zinc-700"
        >
          <span className="text-sm font-medium">{selectedModel.name}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden py-2 z-50 max-h-[80vh] overflow-y-auto">
            {CAR_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelectModel(model);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-800 transition-colors ${
                  selectedModel.id === model.id ? 'text-red-500 font-bold bg-zinc-800/50' : 'text-zinc-300'
                }`}
              >
                {model.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onDownload}
        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors font-medium text-sm"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export Wrap</span>
      </button>
    </header>
  );
};

export default Header;
