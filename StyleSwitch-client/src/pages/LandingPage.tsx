import React from 'react';
import Navbar from '../components/Navbar';

interface ProductCard {
  id: number;
  title: string;
  category: string;
  pricePerDay: string;
  imageUrl: string;
}

const LandingPage: React.FC = () => {

  const featuredProducts: ProductCard[] = [
    {
      id: 1,
      title: 'Classic Midnight Tuxedo',
      category: 'Formal Wear',
      pricePerDay: '$29',
      imageUrl:
        'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      title: 'Emerald Silk Evening Gown',
      category: 'Dresses',
      pricePerDay: '$35',
      imageUrl:
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      title: 'Minimalist Designer Blazer',
      category: 'Outerwear',
      pricePerDay: '$18',
      imageUrl:
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 4,
      title: 'Vintage Leather Trench',
      category: 'Streetwear',
      pricePerDay: '$22',
      imageUrl:
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-mono antialiased">

      {/* Navbar */}
      <Navbar />

      {/* =========================================================
          HERO SECTION
      ========================================================= */}

      <header className="relative bg-gray-50 border-b border-gray-100 py-10 lg:py-16">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div className="space-y-6 max-w-xl">

            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              The Evolution of Wardrobe
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-none">
              Wear luxury.
              <br />
              Switch anytime.
              <br />
              Own nothing.
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed">
              Access thousands of high-end designer pieces without the
              commitment. Rent, wear, return, and switch up your look whenever
              inspiration strikes.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">

              <a
                href="#collection"
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-md font-medium shadow-sm transition-all text-center"
              >
                Explore Collection
              </a>

              <a
                href="#how-it-works"
                className="border border-gray-300 hover:border-gray-900 bg-white px-8 py-3.5 rounded-md font-medium text-gray-700 hover:text-gray-900 transition-all text-center"
              >
                How It Works
              </a>

            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-96 lg:h-[450px] bg-gray-200 rounded-xl overflow-hidden shadow-inner">

            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85"
              alt="High fashion rental clothing collection"
              className="w-full h-full object-cover grayscale brightness-95 contrast-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />

            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-xs uppercase tracking-widest opacity-75">
                Premium Quality
              </p>

              <p className="text-lg font-bold">
                Curated Designer Fits
              </p>
            </div>

          </div>
        </div>
      </header>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}

      <section
        id="how-it-works"
        className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >

        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">

          <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            Simple Process
          </span>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Three Steps To Perfect Style
          </h2>

          <p className="text-gray-500">
            We make switching up your wardrobe effortless, sustainable, and
            affordable.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="p-6 bg-white border border-gray-200 rounded-lg space-y-4 hover:shadow-md transition-shadow">

            <div className="w-10 h-10 rounded-md bg-gray-900 text-white font-bold flex items-center justify-center">
              1
            </div>

            <h3 className="font-bold text-lg">
              Pick Your Look
            </h3>

            <p className="text-gray-500 text-sm leading-relaxed">
              Browse through our curated collection of luxury wear,
              streetwear, and event outfits tailored to your taste.
            </p>

          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg space-y-4 hover:shadow-md transition-shadow">

            <div className="w-10 h-10 rounded-md bg-gray-100 text-gray-900 border border-gray-200 font-bold flex items-center justify-center">
              2
            </div>

            <h3 className="font-bold text-lg">
              Wear & Flaunt It
            </h3>

            <p className="text-gray-500 text-sm leading-relaxed">
              Keep the garments for your chosen rental duration. Enjoy
              dry-cleaned, ready-to-wear premium threads.
            </p>

          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg space-y-4 hover:shadow-md transition-shadow">

            <div className="w-10 h-10 rounded-md bg-gray-100 text-gray-900 border border-gray-200 font-bold flex items-center justify-center">
              3
            </div>

            <h3 className="font-bold text-lg">
              Switch & Repeat
            </h3>

            <p className="text-gray-500 text-sm leading-relaxed">
              Send it back using our prepaid packaging, then select your next
              statement piece. We handle all the laundry!
            </p>

          </div>

        </div>
      </section>

      {/* =========================================================
          FEATURED COLLECTION
      ========================================================= */}

      <section
        id="collection"
        className="bg-gray-50 border-t border-b border-gray-200/60 py-16"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">

            <div className="space-y-2">

              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                Featured Collection
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Pieces Worth Switching For
              </h2>

              <p className="text-gray-500 max-w-xl">
                Discover premium pieces from independent designers and
                fashion-forward wardrobes.
              </p>

            </div>

            <a
              href="#collection"
              className="text-sm font-semibold text-gray-900 border-b border-gray-900 pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors"
            >
              View All Collection →
            </a>

          </div>

          {/* Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {featuredProducts.map((product) => (

              <div
                key={product.id}
                className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
              >

                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">

                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                      {product.category}
                    </span>
                  </div>

                  <button className="absolute bottom-4 left-4 right-4 bg-white text-gray-900 py-2.5 rounded-md font-semibold text-sm opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-md">
                    View Details
                  </button>

                </div>

                <div className="p-5">

                  <h3 className="font-semibold text-gray-900 mb-2">
                    {product.title}
                  </h3>

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-gray-500">
                      From
                    </span>

                    <span className="font-bold text-gray-900">
                      {product.pricePerDay}
                      <span className="font-normal text-gray-500 text-xs">
                        {' '}
                        / day
                      </span>
                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>
        </div>
      </section>

      {/* =========================================================
          WHY STYLE SWITCH
      ========================================================= */}

      <section
        id="about"
        className="py-16 bg-white"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Image */}
            <div className="relative h-[450px] rounded-xl overflow-hidden">

              <img
                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85"
                alt="Fashion styling"
                className="w-full h-full object-cover"
              />

            </div>

            {/* Content */}
            <div className="space-y-8">

              <div className="space-y-3">

                <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                  Why Style Switch
                </span>

                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Your wardrobe should evolve with you.
                </h2>

                <p className="text-gray-500 leading-relaxed">
                  Trends change. Events happen. Your personal style evolves.
                  Buying a new outfit every time shouldn't be the answer.
                </p>

              </div>

              <div className="space-y-6">

                <div className="flex gap-4">

                  <div className="flex-shrink-0 w-10 h-10 bg-gray-900 text-white rounded-md flex items-center justify-center">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Premium Quality
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Every item is inspected and professionally cleaned
                      before reaching you.
                    </p>
                  </div>

                </div>

                <div className="flex gap-4">

                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center font-bold">
                    ₹
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Affordable Luxury
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Wear premium fashion without paying the full retail
                      price.
                    </p>
                  </div>

                </div>

                <div className="flex gap-4">

                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center">
                    ↻
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Endless Possibilities
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Switch your style whenever you want and keep your
                      wardrobe fresh.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          CALL TO ACTION
      ========================================================= */}

      <section className="bg-gray-900 text-white py-16">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            Ready To Switch?
          </span>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mt-4">
            Your next look is waiting.
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto mt-5 leading-relaxed">
            Explore thousands of fashion pieces, find your next favorite
            outfit, and experience a better way to dress.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">

            <a
              href="#collection"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3.5 rounded-md font-semibold transition-colors"
            >
              Explore Collection
            </a>

            <button className="border border-gray-600 hover:border-white text-white px-8 py-3.5 rounded-md font-semibold transition-colors">
              Create Account
            </button>

          </div>

        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

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

    </div>
  );
};

export default LandingPage;