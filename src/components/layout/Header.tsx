interface HeaderProps {
  title?: string;
  subtitle?: string;
  showImage?: boolean;
}

export function Header({ 
  title = "Post-Strike Assessment:", 
  subtitle = "Israeli and U.S. Strikes Caused Major Bottlenecks in Iran's Nuclear Weapons Supply Chain",
  showImage = true 
}: HeaderProps) {
  return (
    <div className="pt-[100px] gap-7 flex flex-col items-center"> {/* Account for fixed navigation */}
      {showImage && <HeaderImageContainer />}
      <TitleContainer title={title} subtitle={subtitle} />
    </div>
  );
}

function HeaderImageContainer() {
  return (
    <div className="relative flex-shrink-0 w-full max-w-[1010px] h-[400px]">
      <div 
        className="absolute top-0 left-0 w-full h-full z-10 bg-contain bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/images/feature.png')",
        }}
        onError={() => {
          // Fallback gradient background if image doesn't load
          const element = document.querySelector('.header-fallback') as HTMLElement;
          if (element) {
            element.style.background = 'linear-gradient(135deg, #00558c 0%, #003d63 100%)';
          }
        }}
      >
        {/* Fallback content */}
        <div className="header-fallback w-full h-full bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold opacity-90">Placeholder</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

function TitleContainer({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 relative flex-shrink-0 w-full max-w-[800px] gap-2.5 mt-5">
      <div className="flex text-center" style={{ color: '#00558c', letterSpacing: '-0.3px', fontFamily: "'URW DIN', sans-serif", fontWeight: 600, fontSize: '48px' }}>
        <h1 className="block w-full m-0 leading-10" style={{ fontSize: 'inherit' }}>
          {title}
        </h1>
      </div>
      <div className="flex flex-col justify-center">
        <p className="flex text-center uppercase" style={{ 
          color: '#00558c', 
          letterSpacing: '-0.3px', 
          fontFamily: "'URW DIN', sans-serif", 
          fontWeight: 600, 
          fontSize: '25px', 
          lineHeight: '28px' 
        }}>
          {subtitle}
        </p>
      </div>
      
      <div className="w-12 h-0.5 bg-gray-300 mt-4"></div>
    </div>
  );
}