import React from 'react';

interface HeroBannerProps {
  onOpenAI: (samplePrompt?: string) => void;
  onApplyPromo: (code: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenAI, onApplyPromo }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 pb-4 space-y-4">
      {/* Top Main Banner */}
      <div className="relative w-full rounded-[20px] bg-[#3B823E] overflow-hidden flex items-stretch min-h-[220px] sm:min-h-[260px] shadow-sm">
        <div className="relative z-10 w-full md:w-[55%] p-6 sm:p-10 flex flex-col justify-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 sm:mb-4 leading-tight tracking-tight">
            Stock up on daily essentials
          </h1>
          <p className="text-white/95 text-sm sm:text-lg font-medium mb-6 sm:mb-8 max-w-lg leading-snug">
            Get farm-fresh goodness & a range of exotic fruits, vegetables, eggs & more
          </p>
          <div>
            <button 
              onClick={() => onApplyPromo('FRESH100')}
              className="bg-white text-gray-900 font-bold px-6 py-2.5 rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition-all w-max"
            >
              Shop Now
            </button>
          </div>
        </div>
        
        {/* Right side image */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 md:w-[55%] h-full">
          {/* Gradient overlay to blend image into the green background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3B823E] via-[#3B823E]/80 to-transparent z-10 w-1/3"></div>
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80" 
            alt="Fresh Vegetables and Groceries" 
            className="w-full h-full object-cover object-right sm:object-center"
          />
        </div>
      </div>

      {/* Bottom 3 Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Pharmacy Banner */}
        <div className="relative rounded-2xl bg-[#00C2C7] overflow-hidden p-5 sm:p-6 shadow-sm min-h-[170px] flex flex-col">
          <div className="relative z-10 w-[70%]">
            <h3 className="text-white font-extrabold text-lg sm:text-xl leading-tight mb-2 tracking-tight">
              Pharmacy at your doorstep!
            </h3>
            <p className="text-white/95 text-xs sm:text-sm font-medium mb-5 leading-snug">
              Cough syrups, pain relief sprays & more
            </p>
            <button 
              onClick={() => onOpenAI('medicines and pain relief')}
              className="bg-white text-gray-900 font-bold px-4 py-2 rounded-lg text-xs shadow-sm hover:bg-gray-50 active:scale-95 transition-all w-max mt-auto"
            >
              Order Now
            </button>
          </div>
          {/* Decorative image for Pharmacy */}
          <div className="absolute right-0 bottom-0 w-1/3 h-[90%] flex items-end">
             <img 
                src="https://images.unsplash.com/photo-1584308666744-24d59b298f07?auto=format&fit=crop&w=400&q=80" 
                alt="Medicines" 
                className="w-full h-full object-cover rounded-tl-full opacity-90 shadow-2xl"
             />
          </div>
        </div>
        
        {/* Pet Care Banner */}
        <div className="relative rounded-2xl bg-[#FFC107] overflow-hidden p-5 sm:p-6 shadow-sm min-h-[170px] flex flex-col">
          <div className="relative z-10 w-[65%]">
            <h3 className="text-gray-900 font-extrabold text-lg sm:text-xl leading-tight mb-2 tracking-tight">
              Pet care supplies at your door
            </h3>
            <p className="text-gray-900/80 text-xs sm:text-sm font-semibold mb-5 leading-snug">
              Food, treats, toys & more
            </p>
            <button 
              onClick={() => onOpenAI('pet food and toys')}
              className="bg-gray-800 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm hover:bg-gray-900 active:scale-95 transition-all w-max mt-auto"
            >
              Order Now
            </button>
          </div>
          {/* Decorative image for Pets */}
          <div className="absolute -right-4 -bottom-4 w-[60%] h-[110%] flex items-end">
             <img 
                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80" 
                alt="Pets" 
                className="w-full h-full object-cover object-left-top mix-blend-multiply opacity-90"
             />
          </div>
        </div>

        {/* Baby Care Banner */}
        <div className="relative rounded-2xl bg-[#D6E0EB] overflow-hidden p-5 sm:p-6 shadow-sm min-h-[170px] flex flex-col">
          <div className="relative z-10 w-[65%]">
            <h3 className="text-gray-900 font-extrabold text-lg sm:text-xl leading-tight mb-2 tracking-tight">
              No time for a diaper run?
            </h3>
            <p className="text-gray-900/70 text-xs sm:text-sm font-semibold mb-5 leading-snug">
              Get baby care essentials
            </p>
            <button 
              onClick={() => onOpenAI('baby care and diapers')}
              className="bg-gray-800 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm hover:bg-gray-900 active:scale-95 transition-all w-max mt-auto"
            >
              Order Now
            </button>
          </div>
          {/* Decorative image for Baby */}
          <div className="absolute right-0 bottom-0 w-[45%] h-full flex items-end justify-end">
             <img 
                src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=400&q=80" 
                alt="Baby Care" 
                className="w-full h-full object-cover object-left opacity-90 mix-blend-multiply"
             />
          </div>
        </div>

      </div>
    </div>
  );
};

