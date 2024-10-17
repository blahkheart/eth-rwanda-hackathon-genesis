export function JumbotronSection() {
  return (
    <div
      className="relative h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/placeholder.svg?height=1080&width=1920')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">ETH RWANDA HACKATHON</h1>
        <p className="text-2xl mb-8">GENESIS</p>
        <div className="flex justify-center space-x-8">
          {/* Ethereum Logo */}
          <svg className="w-16 h-16" viewBox="0 0 784.37 1277.39" xmlns="http://www.w3.org/2000/svg">
            {/* SVG content */}
          </svg>
          {/* Smart Contract Icon */}
          <svg
            className="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* SVG content */}
          </svg>
          {/* Blockchain Icon */}
          <svg
            className="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* SVG content */}
          </svg>
        </div>
      </div>
    </div>
  );
}
