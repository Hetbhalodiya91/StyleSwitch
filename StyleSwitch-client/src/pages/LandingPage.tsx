import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, RefreshCw, Feather, Layers, Compass, CheckCircle2 } from 'lucide-react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { clothService, type ClothItem } from '../api/clothService';

interface LandingPageProps {
  onBrowse?: () => void;
  onSignup?: () => void;
  onViewDetail?: (clothId: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onBrowse, onSignup, onViewDetail }) => {
  const [featuredProducts, setFeaturedProducts] = useState<ClothItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 500], [0, 60]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.98]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await clothService.getAll();
        if (response.clothes && response.clothes.length > 0) {
          setFeaturedProducts(response.clothes.slice(0, 4));
        } else {
          setFeaturedProducts([]);
        }
      } catch (err) {
        console.warn("Failed to fetch featured collection:", err);
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    },
  };

  const staggerContainer: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  return (
    <div className="landing-page bg-[#f4f5f8] text-[#111215] overflow-x-hidden selection:bg-[#e11d48] selection:text-white">
      {/* =========================================================
          TOP TICKER: HAUTE ARCHIVE MARQUEE
      ========================================================= */}
      <div className="bg-[#111215] text-[#f4f5f8] py-2.5 px-4 overflow-hidden border-b border-[#1e2026]">
        <div className="flex items-center justify-between max-w-7xl mx-auto text-[11px] font-mono tracking-widest uppercase opacity-85">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-pulse" />
            STYLE/SWITCH ATELIER · ARCHIVAL ISSUE NO. 2026
          </span>
          <span className="hidden md:inline-block text-[#94a3b8]">
            SABYASACHI · MANISH MALHOTRA · MANYAVAR · RAYMOND LUXURY · ZARA
          </span>
          <span className="text-[#e11d48] font-bold">100% SANITIZED & INSURED</span>
        </div>
      </div>

      {/* =========================================================
          HERO SECTION (The Press & The Tactile Sleeve)
      ========================================================= */}
      <header className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Subtle Background Tactile Scorelines */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="scoreline-h absolute top-12 left-0 right-0" />
          <div className="scoreline-v absolute top-0 bottom-0 left-12" />
          <div className="scoreline-v absolute top-0 bottom-0 right-12 hidden lg:block" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Typographic Craft */}
          <motion.div
            className="lg:col-span-7 space-y-8 z-10"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Archival Debossed Specimen Tag */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#e2e8f0] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#e11d48] shadow-[0_0_8px_#e11d48]" />
              <span className="text-xs font-mono tracking-wider uppercase font-semibold text-[#111215]">
                Haute Circularity &middot; Rotation Archive
              </span>
              <span className="text-[10px] bg-[#111215] text-white px-2 py-0.5 rounded-full font-mono">
                VOL. IV
              </span>
            </motion.div>

            {/* Giant Editorial Debossed Headline */}
            <motion.div variants={fadeInUp} className="space-y-2">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#111215] leading-[1.02] debossed-title">
                Couture is felt
                <br />
                <span className="italic font-serif-luxury font-normal text-4xl sm:text-5xl xl:text-6xl text-[#64748b] block my-1">
                  before it is worn.
                </span>
                <span className="text-[#e11d48] relative inline-block">
                  Wear &amp; switch.
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#e11d48]/30 rounded-full" />
                </span>
              </h1>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-[#475569] leading-relaxed max-w-xl font-sans-clean font-normal">
              Step beyond single-use ownership. Experience hand-embroidered lehengas, 
              bespoke sherwanis, and Italian tuxedos curated from elite personal archives.
            </motion.p>

            {/* Tactile Actions Bar */}
            <motion.div variants={fadeInUp} className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onBrowse}
                className="group relative bg-[#111215] hover:bg-[#e11d48] text-white px-8 py-4 rounded-xl font-semibold text-sm tracking-wide shadow-[0_12px_28px_-6px_rgba(17,18,21,0.25)] hover:shadow-[0_16px_36px_-6px_rgba(225,29,72,0.4)] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer overflow-hidden active:translate-y-0.5"
              >
                <span className="relative z-10 flex items-center gap-2">
                  EXPLORE THE ROTATION
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>

              <a
                href="#atelier-process"
                className="bg-white hover:bg-[#f8f9fa] border border-[#cbd5e1] hover:border-[#111215] text-[#111215] px-7 py-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 text-center shadow-sm flex items-center justify-center gap-2"
              >
                <Compass size={16} className="text-[#64748b]" />
                Atelier Process
              </a>
            </motion.div>

            {/* Micro specs / Proof points */}
            <motion.div variants={fadeInUp} className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#64748b] font-mono border-t border-[#e2e8f0]/80">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#059669]" /> Authenticity Guaranteed
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#059669]" /> White-Glove Sanitization
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#059669]" /> Zero Security Hassle
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column: Relevo & Vinco Die-Cut Sleeve Experience */}
          <motion.div
            className="lg:col-span-5 relative"
            style={{ y: heroParallax, scale: heroScale }}
          >
            {/* The Master Pressed Sleeve Card */}
            <div className="relative group p-4 sm:p-5 bg-white rounded-3xl border border-[#e2e8f0] shadow-[0_24px_50px_-12px_rgba(17,18,21,0.18)] has-sheen">
              {/* Die-Cut Outer Frame with debossed stamp */}
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#0b0c0e]">
                {/* Hero Image */}
                <img
                  src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85"
                  alt="High fashion bridal and evening wear"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-95"
                />

                {/* Ambient vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e]/90 via-[#0b0c0e]/20 to-transparent pointer-events-none" />

                {/* Top Corner Die-Cut Tag */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/60 shadow-md flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
                  <span className="text-[11px] font-mono font-bold tracking-wider text-[#111215]">
                    HERITAGE EDITION
                  </span>
                </div>

                {/* Sliding Content Sleeve on Hover (Relevo & Vinco Metaphor) */}
                <div className="absolute bottom-0 inset-x-0 p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#e11d48] font-bold block mb-1">
                    Sabyasachi Mukherjee
                  </span>
                  <h3 className="text-2xl font-bold font-serif-luxury tracking-wide text-white">
                    Royal Crimson Bridal Archive
                  </h3>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20 text-xs font-mono text-[#cbd5e1]">
                    <span>PURCHASE: &infin;</span>
                    <span className="text-[#f43f5e] font-bold text-sm">RENT: &#8377;6,500 / DAY</span>
                  </div>
                </div>
              </div>

              {/* Floating Tactile Wax Seal Badge (Overlapping Bottom Right) */}
              <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center justify-center">
                <div className="wax-seal-badge cursor-pointer hover:rotate-12 transition-transform duration-300">
                  <div className="text-center">
                    <span className="text-[9px] font-mono font-bold tracking-tighter block leading-tight">HAUTE</span>
                    <span className="text-[10px] font-bold block font-serif-luxury">2026</span>
                    <span className="text-[8px] font-mono block tracking-tighter">SEAL</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* =========================================================
          THE ARCHIVAL METRIC RIBBON (Debossed Scoreline)
      ========================================================= */}
      <section className="border-y border-[#e2e8f0] bg-white py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#111215] font-display-luxury debossed-light">
              &#8377;4.8 Cr+
            </div>
            <div className="text-xs uppercase tracking-widest font-mono text-[#64748b]">
              Couture Unlocked
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#e11d48] font-display-luxury debossed-light">
              100%
            </div>
            <div className="text-xs uppercase tracking-widest font-mono text-[#64748b]">
              Verified Authenticity
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#111215] font-display-luxury debossed-light">
              &plus;3,200
            </div>
            <div className="text-xs uppercase tracking-widest font-mono text-[#64748b]">
              Gala Rotations Made
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#111215] font-display-luxury debossed-light">
              0%
            </div>
            <div className="text-xs uppercase tracking-widest font-mono text-[#64748b]">
              Textile Waste
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ATELIER PROCESS (Relevo & Vinco Production Line Metaphor)
      ========================================================= */}
      <section id="atelier-process" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest text-[#e11d48] bg-rose-50 border border-rose-100 uppercase font-semibold">
            <Layers size={14} /> The Production Line
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111215] font-display-luxury debossed-title">
            Crafted for Seamless Ceremony
          </h2>
          <p className="text-[#64748b] text-base sm:text-lg max-w-xl mx-auto">
            Like a bespoke packaging fold, every phase is engineered with physical precision, 
            so your moment in the spotlight is completely effortless.
          </p>
        </div>

        {/* 3 Physical Pressed Board Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "The Archival Selection",
              desc: "Explore verified designer pieces with live calendar availability. Select your dates without clashing bookings.",
              tag: "INSPECTION // NO. 01",
              icon: Compass,
            },
            {
              step: "02",
              title: "The White-Glove Delivery",
              desc: "Delivered to your doorstep in pristine, eco-luxe archival garment packaging, dry-cleaned, pressed, and event-ready.",
              tag: "PREPARATION // NO. 02",
              icon: Feather,
            },
            {
              step: "03",
              title: "The Circular Rotation",
              desc: "Flaunt your look. When your ceremony concludes, our courier retrieves the piece. No dry-cleaning, no storage burden.",
              tag: "COMPLETION // NO. 03",
              icon: RefreshCw,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="tactile-board p-8 flex flex-col justify-between group cursor-default relative overflow-hidden"
            >
              {/* Top Row: Die-cut Punched Disc & Tag */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-xl bg-[#111215] text-[#e11d48] font-mono font-bold flex items-center justify-center text-lg shadow-sm group-hover:bg-[#e11d48] group-hover:text-white transition-colors duration-300">
                    {item.step}
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-[#94a3b8] uppercase border border-[#e2e8f0] px-2.5 py-1 rounded-md bg-[#f8fafc]">
                    {item.tag}
                  </span>
                </div>

                <h3 className="font-bold text-2xl text-[#111215] mb-3 font-serif-luxury group-hover:text-[#e11d48] transition-colors">
                  {item.title}
                </h3>

                <p className="text-[#64748b] text-sm leading-relaxed font-sans-clean">
                  {item.desc}
                </p>
              </div>

              {/* Bottom Subtle Detail Line */}
              <div className="pt-8 mt-8 border-t border-[#f1f5f9] flex items-center justify-between text-xs font-mono text-[#94a3b8]">
                <span>STATUS: VERIFIED</span>
                <span className="text-[#111215] font-bold group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          FEATURED ARCHIVAL ROTATION (Live MongoDB Data)
      ========================================================= */}
      <section id="collection" className="bg-[#ffffff] border-y border-[#e2e8f0] py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-14 gap-6">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold tracking-widest text-[#e11d48] uppercase bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                Curated Rotation Archive
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111215] font-display-luxury debossed-title">
                Specimens Available For Booking
              </h2>
              <p className="text-[#64748b] max-w-xl text-base font-sans-clean">
                Live designer pieces currently in rotation. Click any garment to view its 
                availability calendar, fabric details, and lender profile.
              </p>
            </div>

            <button
              onClick={onBrowse}
              className="group inline-flex items-center gap-2 text-sm font-bold text-[#111215] hover:text-[#e11d48] transition-colors pb-1 border-b-2 border-[#111215] hover:border-[#e11d48] cursor-pointer"
            >
              EXPLORE FULL WARDROBE
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Product Cards Grid */}
          {isLoading ? (
            <div className="text-center py-24">
              <div className="w-10 h-10 border-3 border-[#111215] border-t-[#e11d48] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#64748b] text-sm font-mono">
                Accessing archival vault records...
              </p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
              {featuredProducts.map((product, idx) => (
                <div
                  key={product._id}
                  className="tactile-board overflow-hidden flex flex-col group cursor-pointer"
                  onClick={() => onViewDetail ? onViewDetail(product._id) : onBrowse?.()}
                >
                  {/* Image Container with Die-cut aesthetic */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#111215]">
                    <img
                      src={
                        product.images?.[0] ||
                        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={product.brand}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 brightness-95"
                    />

                    {/* Category pill */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#111215]/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-mono tracking-wider">
                        {product.category}
                      </span>
                    </div>

                    {/* Specimen Index Tag */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 backdrop-blur-md text-[#111215] px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Hover Button Sleeve */}
                    <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewDetail) onViewDetail(product._id);
                          else onBrowse?.();
                        }}
                        className="w-full bg-[#111215] hover:bg-[#e11d48] text-white py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        RENT NOW <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Information Plate */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <span className="text-[11px] text-[#e11d48] uppercase tracking-widest font-mono font-bold block mb-1">
                        {product.brand}
                      </span>
                      <h3 className="font-bold text-[#111215] text-lg font-serif-luxury line-clamp-1 group-hover:text-[#e11d48] transition-colors">
                        {product.description || `${product.brand} ${product.category}`}
                      </h3>
                      <p className="text-xs text-[#94a3b8] font-mono mt-1">
                        Size: {product.size} &middot; City: {product.city}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#f1f5f9]">
                      <span className="text-xs text-[#64748b] font-mono">Daily Rental</span>
                      <div className="text-right">
                        <span className="font-extrabold text-[#e11d48] text-lg">
                          &#8377;{product.rentalPricePerDay?.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-[#94a3b8] font-mono"> / day</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#f8f9fa] rounded-2xl p-16 text-center border border-[#e2e8f0] max-w-lg mx-auto">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-[#e11d48] text-xl shadow-sm border border-[#e2e8f0]">
                &#10022;
              </div>
              <h3 className="text-xl font-bold text-[#111215] font-serif-luxury">
                Vault Refresh in Progress
              </h3>
              <p className="text-sm text-[#64748b] mt-2 mb-6 font-sans-clean">
                Our collectors are currently listing fresh bridal and evening wear.
              </p>
              <button
                onClick={onBrowse}
                className="bg-[#111215] hover:bg-[#e11d48] text-white px-7 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Browse All Pieces
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          THE TACTILITY & FABRIC ATELIER (Relevo & Vinco Material Depth)
      ========================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Tactile Editorial Visual */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#e2e8f0] aspect-[4/3] bg-[#111215]">
              <img
                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85"
                alt="Luxury fabric weave and embroidery"
                className="w-full h-full object-cover brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111215] via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[11px] font-mono tracking-widest text-[#e11d48] uppercase font-bold block mb-1">
                  TACTILE CRAFTSMANSHIP
                </span>
                <p className="text-2xl font-serif-luxury font-bold">
                  Mulberry Silks, Zari Zardozi &amp; Super 150s Wools
                </p>
              </div>
            </div>

            {/* Micro floating specimen card */}
            <div className="absolute -top-6 -right-6 hidden sm:block bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xl max-w-[220px]">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-[#e11d48]" />
                <span className="text-xs font-bold font-mono text-[#111215]">ATELIER GRADE</span>
              </div>
              <p className="text-[11px] text-[#64748b]">
                Maintained through museum-grade non-toxic dry cleansing before every handover.
              </p>
            </div>
          </div>

          {/* Right: The Philosophy of Inkless / Tactile Luxury */}
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold tracking-widest text-[#e11d48] uppercase bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                The Philosophy
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111215] font-display-luxury debossed-title leading-tight">
                Luxury without the weight of ownership.
              </h2>
              <p className="text-[#475569] leading-relaxed text-base font-sans-clean">
                Traditional retail asks you to invest a fortune for garments worn once, 
                relegated to dark wardrobes. StyleSwitch frees couture to live forever, 
                giving each breathtaking weave multiple lives of celebration.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Circular Haute Couture",
                  desc: "Drastically reduce textile consumption while wearing pieces by India & the world's most renowned ateliers.",
                },
                {
                  title: "Real-Time Date Reservation",
                  desc: "Book ahead for weddings, anniversaries, and galas with an interactive calendar ensuring zero clashes.",
                },
                {
                  title: "Insured & Security-Free Experience",
                  desc: "Every rental is shielded with our transparent, 100% refundable security deposit protocol.",
                },
              ].map((point, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:border-[#cbd5e1] transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#111215] text-[#e11d48] flex items-center justify-center font-bold text-sm">
                    0{i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111215] text-base font-serif-luxury">{point.title}</h3>
                    <p className="text-xs text-[#64748b] mt-1 leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          THE GRAND OBSIDIAN VAULT (Call to Action)
      ========================================================= */}
      <section className="bg-[#0b0c0e] text-white py-28 relative overflow-hidden border-t border-[#1e2026]">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e11d48]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-widest text-[#e11d48] bg-rose-950/60 border border-rose-900/60 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
            Your Invitation To The Archive
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-display-luxury debossed-dark leading-tight">
            Your next grand entrance is already waiting.
          </h2>

          <p className="text-[#94a3b8] max-w-2xl mx-auto text-base sm:text-lg font-sans-clean leading-relaxed">
            Reserve today for your upcoming celebration. Discover handcrafted silhouettes 
            and elevate your personal style on your terms.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={onBrowse}
              className="w-full sm:w-auto bg-[#e11d48] hover:bg-[#be123c] text-white px-9 py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_12px_28px_rgba(225,29,72,0.4)] cursor-pointer active:translate-y-0.5"
            >
              EXPLORE THE COLLECTION
            </button>

            <button
              onClick={onSignup}
              className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-white/20 hover:border-white text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-colors cursor-pointer"
            >
              JOIN THE ATELIER CLUB
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
