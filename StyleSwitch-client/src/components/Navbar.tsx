import React, { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  children: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const navItems: NavItem[] = [
    { label: 'MEN', href: '#collection' },
    { label: 'WOMEN', href: '#how-it-works' },
    { label: 'EARN THROUGH US', href: '#pricing' },
    { label: 'CUSTOMER STORIES', href: '#about' },
  ];

  return (
    <>
    
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a
              href="#"
              className="text-xl font-black text-gray-900 tracking-wider uppercase"
            >
              Style Switch
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
              Sign In
            </button>

            <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
              Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-gray-500 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">

            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}

            <div className="pt-4 pb-2 border-t border-gray-200 px-3 flex flex-col space-y-2">

              <button className="w-full text-center text-gray-600 hover:text-gray-900 font-medium py-2 text-sm transition-colors">
                Sign In
              </button>

              <button className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
                Login
              </button>

            </div>
          </div>
        </div>
      )}
    </nav>

      <main className="">
        {children}
      </main>

            <footer className="bg-white border-t border-gray-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

            {/* Brand */}
            <div>

              <h3 className="text-xl font-black tracking-wider uppercase">
                Style Switch
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed mt-4">
                Fashion rental for people who believe their wardrobe should
                never stand still.
              </p>

            </div>

            {/* Explore */}
            <div>

              <h4 className="font-bold text-sm">
                Explore
              </h4>

              <ul className="mt-4 space-y-3 text-sm text-gray-500">
                <li>
                  <a href="#collection" className="hover:text-gray-900">
                    Collection
                  </a>
                </li>

                <li>
                  <a href="#pricing" className="hover:text-gray-900">
                    Pricing
                  </a>
                </li>

                <li>
                  <a href="#how-it-works" className="hover:text-gray-900">
                    How It Works
                  </a>
                </li>
              </ul>

            </div>

            {/* Company */}
            <div>

              <h4 className="font-bold text-sm">
                Company
              </h4>

              <ul className="mt-4 space-y-3 text-sm text-gray-500">

                <li>
                  <a href="#about" className="hover:text-gray-900">
                    About Us
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-gray-900">
                    Contact
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-gray-900">
                    Careers
                  </a>
                </li>

              </ul>

            </div>

            {/* Support */}
            <div>

              <h4 className="font-bold text-sm">
                Support
              </h4>

              <ul className="mt-4 space-y-3 text-sm text-gray-500">

                <li>
                  <a href="#" className="hover:text-gray-900">
                    Help Center
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-gray-900">
                    Shipping & Returns
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-gray-900">
                    Privacy Policy
                  </a>
                </li>

              </ul>

            </div>

          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col sm:flex-row justify-between gap-4">

            <p className="text-xs text-gray-500">
              © 2026 Style Switch. All rights reserved.
            </p>

            <div className="flex gap-5 text-xs text-gray-500">

              <a href="#" className="hover:text-gray-900">
                Instagram
              </a>

              <a href="#" className="hover:text-gray-900">
                Facebook
              </a>

              <a href="#" className="hover:text-gray-900">
                X
              </a>

            </div>

          </div>

        </div>
      </footer>
      </>
  );
};

export default Navbar;