import Image from "next/image";

export function Navigation() {
  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
      <div className="w-full py-6 flex items-center justify-between border-b border-green-500 lg:border-none">
        <div className="flex items-center">
          <a href="#">
            <span className="sr-only">ETH RWANDA HACKATHON</span>
            <Image src="/placeholder.svg?height=32&width=32" alt="Logo" width={32} height={32} className="h-8 w-auto" />
          </a>
          <div className="hidden ml-10 space-x-8 lg:block">
            <a href="#" className="text-base font-medium text-white hover:text-green-100">
              Home
            </a>
            <a href="#" className="text-base font-medium text-white hover:text-green-100">
              About
            </a>
            <a href="#" className="text-base font-medium text-white hover:text-green-100">
              Schedule
            </a>
            <a href="#" className="text-base font-medium text-white hover:text-green-100">
              Contact
            </a>
          </div>
        </div>
        <div className="ml-10 space-x-4">
          <a
            href="#"
            className="inline-block bg-yellow-400 py-2 px-4 border border-transparent rounded-md text-base font-medium text-black hover:bg-yellow-300"
          >
            Connect Wallet
          </a>
        </div>
      </div>
    </nav>
  );
}
