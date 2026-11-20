import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Compass,
  Star,
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Watch,
  Users,
  Sparkles,
  Plane,
  Train,
  Bus,
  Car,
  HeartHandshake,
  Building,
  Flame,
  Zap
} from 'lucide-react';
import { TravelSearchPanel } from '../../components/forms/TravelSearchPanel';
import { TourCard } from '../../components/cards/TourCard';
import { HotelCard } from '../../components/cards/HotelCard';
import type { Tour } from '../../data/tours';
import { tourService } from '../../services/mock/tourService';
import { getApiErrorMessage } from '../../services/apiClient';
import { hotels, hotelCategories } from '../../data/hotels';
import { destinations } from '../../data/destinations';
import { guides } from '../../data/users';
import { testimonials } from '../../data/testimonials';
import { flights } from '../../data/flights';
import { trains } from '../../data/trains';
import { buses } from '../../data/buses';

const heroSlides = [
  {
    titleLead: 'Find your next',
    titleAccent: 'unforgettable escape.',
    description: 'From golden beaches to hidden coastal gems, experience Goa beyond the ordinary.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=90',
    imagePosition: 'center 55%',
    eyebrow: 'EXPLORE INDIA  /  COASTAL ESCAPES',
    place: 'Goa, India',
    primaryLabel: 'Explore destinations',
    primaryTo: '/destinations',
    secondaryLabel: 'Discover tour packages',
    secondaryTo: '/tours?destination=Goa'
  },
  {
    titleLead: 'Beyond the mountains,',
    titleAccent: 'adventure awaits.',
    description: 'Discover breathtaking trails, peaceful valleys and unforgettable mountain journeys.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=90',
    imagePosition: 'center 48%',
    eyebrow: 'ADVENTURE  /  MOUNTAIN ESCAPES',
    place: 'The Himalayas',
    primaryLabel: 'Explore treks',
    primaryTo: '/tours?category=trek',
    secondaryLabel: 'Plan your adventure',
    secondaryTo: '/tours?category=trek'
  },
  {
    titleLead: 'Escape into',
    titleAccent: 'nature’s beauty.',
    description: 'Experience serene backwaters, lush landscapes and the beauty of God’s Own Country.',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2200&q=90',
    imagePosition: 'center 52%',
    eyebrow: 'NATURE  /  SLOW TRAVEL',
    place: 'Kerala, India',
    primaryLabel: 'Explore Kerala',
    primaryTo: '/destinations',
    secondaryLabel: 'Discover experiences',
    secondaryTo: '/tours?destination=Kerala'
  },
  {
    titleLead: 'Step into stories',
    titleAccent: 'written in stone.',
    description: 'Find timeless architecture, vibrant old cities and the rich heritage of India.',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2200&q=90',
    imagePosition: 'center 14%',
    eyebrow: 'CULTURE  /  TIMELESS HERITAGE',
    place: 'Agra, India',
    primaryLabel: 'Explore destinations',
    primaryTo: '/destinations',
    secondaryLabel: 'Discover tour packages',
    secondaryTo: '/tours?category=heritage'
  }
];

export const HomePage: React.FC = () => {
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([]);
  const [tourLoadError, setTourLoadError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const imagePreload = document.createElement('link');
    imagePreload.rel = 'preload';
    imagePreload.as = 'image';
    imagePreload.href = heroSlides[0].image;
    imagePreload.setAttribute('fetchpriority', 'high');
    document.head.appendChild(imagePreload);
    return () => imagePreload.remove();
  }, []);

  useEffect(() => {
    let active = true;
    tourService.getFeatured()
      .then((loadedTours) => {
        if (active) setFeaturedTours(loadedTours);
      })
      .catch((error) => {
        if (active) setTourLoadError(getApiErrorMessage(error, 'Featured tours could not be loaded.'));
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    const timer = setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <section
        aria-label="Featured travel destinations"
        aria-roledescription="carousel"
        className="px-4 pb-0 pt-24 sm:px-6 sm:pt-28 lg:pt-28"
      >
        <div className="mx-auto max-w-[1500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-[#111726]">
          <div className="relative h-[620px] overflow-hidden bg-slate-200 sm:h-[500px] lg:h-[520px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.65, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <img
                  src={heroSlides[currentSlide].image}
                  alt=""
                  aria-hidden="true"
                  width={2200}
                  height={1467}
                  fetchPriority={currentSlide === 0 ? 'high' : 'auto'}
                  loading={currentSlide === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  style={{ objectPosition: heroSlides[currentSlide].imagePosition }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/10 via-transparent to-transparent" />

            <div className="absolute inset-y-0 left-0 flex w-full items-center px-4 sm:px-8 lg:px-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
                  className="w-full max-w-[600px] rounded-3xl border-l-4 border-emerald-600 bg-white px-5 py-7 text-slate-900 shadow-2xl shadow-slate-950/20 sm:px-9 sm:py-8 lg:px-11"
            >
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-violet-800 sm:text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                    <span>{heroSlides[currentSlide].eyebrow}</span>
                  </div>

                  <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-[3.5rem]">
                    {heroSlides[currentSlide].titleLead}
                    <span className="mt-1 block">{heroSlides[currentSlide].titleAccent}</span>
                  </h1>

                  <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                    {heroSlides[currentSlide].description}
                  </p>

                  <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                    <Link
                      to={heroSlides[currentSlide].primaryTo}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                    >
                      {heroSlides[currentSlide].primaryLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to={heroSlides[currentSlide].secondaryTo}
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-bold text-slate-800 transition hover:border-violet-400 hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700"
                    >
                      {heroSlides[currentSlide].secondaryLabel}
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex min-h-14 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-[#111726] sm:px-6">
            <span className="hidden min-w-32 text-xs font-semibold text-slate-600 dark:text-slate-300 sm:block">
              {String(currentSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')} · {heroSlides[currentSlide].place}
            </span>
            <div className="flex items-center gap-2" role="group" aria-label="Choose a destination">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.place}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Show ${slide.place}`}
                  aria-current={index === currentSlide ? 'true' : undefined}
                  className={`h-2.5 rounded-full border-2 transition-all ${index === currentSlide ? 'w-6 border-violet-700 bg-violet-700' : 'w-2.5 border-violet-700 bg-white hover:bg-violet-100'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
                aria-label="Previous destination"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsPaused((paused) => !paused)}
                aria-label={isPaused ? 'Resume automatic slides' : 'Pause automatic slides'}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)}
                aria-label="Next destination"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4 pt-8">
        <TravelSearchPanel compact />
      </section>

      {/* ========================================================= */}
      {/* 3. TRENDING DESTINATIONS SECTION                          */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200/60 dark:border-emerald-800/50">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span>Trending Destinations</span>
            </div>
            <h2 className="section-title">Iconic Indian Circuits</h2>
            <p className="section-subtitle mt-1">
              From snow summits to royal havelis and sun-kissed coasts
            </p>
          </div>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            View all 15+ Destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.slice(0, 4).map((dest) => (
            <Link
              key={dest.id}
              to={`/destinations/${dest.id}`}
              className="group relative h-96 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200/60 dark:border-slate-800"
            >
              <img
                src={dest.heroImage}
                alt={dest.name}
                width={1200}
                height={900}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-xs text-emerald-300 font-bold tracking-wide uppercase">
                  {dest.state}
                </span>
                <h3 className="font-heading text-2xl font-black mt-1 text-white group-hover:text-emerald-200 transition-colors">
                  {dest.name}
                </h3>
                <p className="text-xs text-slate-200 mt-1.5 line-clamp-2 font-normal leading-relaxed">
                  {dest.tagline}
                </p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                  Explore Guide <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. POPULAR TOUR PACKAGES SECTION                          */}
      {/* ========================================================= */}
      <section className="py-16 bg-white dark:bg-[#0D1322] border-y border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2 border border-purple-200/60 dark:border-purple-800/50">
                <Compass className="h-3.5 w-3.5 text-purple-500" />
                <span>Curated Expeditions</span>
              </div>
              <h2 className="section-title">Popular Tour Packages</h2>
              <p className="section-subtitle mt-1">
                All-inclusive guided expeditions led by certified local historians and explorers
              </p>
            </div>
            <Link
              to="/tours"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              Browse All Tours <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
          {tourLoadError && <p role="status" className="mt-5 text-sm text-rose-700 dark:text-rose-300">{tourLoadError}</p>}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. HOMES GUESTS LOVE / RECOMMENDED STAYS                  */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wider mb-2 border border-orange-200/60 dark:border-orange-800/50">
              <Award className="h-3.5 w-3.5 text-orange-500" />
              <span>Handpicked Hospitality</span>
            </div>
            <h2 className="section-title">Homes Guests Love & Recommended Stays</h2>
            <p className="section-subtitle mt-1">
              Top-rated heritage palaces, beachfront villas and luxury mountain resorts
            </p>
          </div>
          <Link
            to="/hotels"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
          >
            Explore All Stays <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.slice(0, 3).map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. BROWSE BY PROPERTY TYPE                                */}
      {/* ========================================================= */}
      <section className="py-14 bg-slate-100/70 dark:bg-[#0E1526] border-y border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-6">
            Browse Stays by Property Type
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {hotelCategories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                to={`/hotels?type=${cat.id}`}
                className="bg-white dark:bg-[#131B2E] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-lg transition-all group"
              >
                <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <Building className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {cat.name}
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                  {cat.count} Properties
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. MULTI-MODAL TRANSIT (FLIGHTS, TRAINS, BUSES)           */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200/60 dark:border-emerald-800/50">
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
            <span>Seamless Mobility</span>
          </div>
          <h2 className="section-title">Multi-Modal Intercity Travel</h2>
          <p className="section-subtitle mt-2">
            Compare domestic flights, premium Vande Bharat trains, and Volvo sleeper buses in one place
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flights Box */}
          <div className="card p-6 border-slate-200/80 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <Plane className="h-5 w-5 rotate-45" />
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Popular Flights</h3>
              </div>
              <Link to="/flights" className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2 flex-1">
              {flights.slice(0, 3).map((f) => (
                <div key={f.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{f.from.city} → {f.to.city}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">{f.airline} • {f.duration}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-slate-900 dark:text-white">₹{f.price.toLocaleString('en-IN')}</span>
                    <Link to="/flights" className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block hover:underline">Book</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trains Box */}
          <div className="card p-6 border-slate-200/80 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                  <Train className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Express Trains</h3>
              </div>
              <Link to="/trains" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2 flex-1">
              {trains.slice(0, 3).map((t) => (
                <div key={t.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">{t.from.code} → {t.to.code} • {t.duration}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-slate-900 dark:text-white">₹{t.classes[0].fare.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">{t.classes[0].status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buses Box */}
          <div className="card p-6 border-slate-200/80 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 flex items-center justify-center">
                  <Bus className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Volvo Buses</h3>
              </div>
              <Link to="/buses" className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2 flex-1">
              {buses.slice(0, 3).map((b) => (
                <div key={b.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{b.from.city} → {b.to.city}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">{b.operator} • {b.duration}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-slate-900 dark:text-white">₹{b.price.toLocaleString('en-IN')}</span>
                    <Link to="/buses" className="text-[11px] font-bold text-orange-600 dark:text-orange-400 block hover:underline">Select Seats</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. NAVIBAND SMART BAND SPOTLIGHT SECTION                   */}
      {/* ========================================================= */}
      <section className="py-20 bg-gradient-to-tr from-slate-950 via-purple-950/80 to-slate-950 text-white relative overflow-hidden border-y border-purple-900/40">
        {/* Glowing blur effects using Green, Purple, and Orange */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5 border border-emerald-500/30">
                <Watch className="h-4 w-4" /> Next-Gen IoT Exploration
              </span>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 leading-tight">
                Meet NaviBand. Real-Time Haptic Navigation on Your Wrist.
              </h2>

              <p className="text-slate-300 text-base mt-4 leading-relaxed max-w-xl">
                Experience eyes-free turn-by-turn trail exploration. Built specifically for high-altitude passes, crowded old bazaar lanes, and open road journeys with sensory vibration and LED alerts.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="font-heading text-2xl font-black text-emerald-400">0.0 ms</div>
                  <div className="text-xs text-slate-300 font-medium mt-1">Direct Haptic Feedback</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="font-heading text-2xl font-black text-orange-400">100%</div>
                  <div className="text-xs text-slate-300 font-medium mt-1">Offline Compass Redundancy</div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/naviband"
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-8 text-sm shadow-xl shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Watch className="h-4 w-4" />
                  <span>Launch NaviBand Simulator</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/road-trips"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition hover:scale-105"
                >
                  <Car className="h-4 w-4" /> Plan Smart Road Trip
                </Link>
              </div>
            </div>

            {/* Visual Watch Preview Widget */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-72 sm:w-80 h-96 rounded-[48px] bg-gradient-to-b from-slate-900 to-black p-4 shadow-2xl border-4 border-slate-700 flex flex-col items-center justify-between text-center">
                {/* Watch Strap Top */}
                <div className="absolute -top-10 h-10 w-32 bg-slate-800 rounded-t-xl" />
                {/* Screen */}
                <div className="w-full h-full bg-slate-950 rounded-[36px] p-5 flex flex-col justify-between border border-emerald-500/30">
                  <div className="flex justify-between items-center text-[10px] text-emerald-400 font-mono">
                    <span>GPS LOCKED</span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  <div className="my-auto">
                    <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300 shadow-lg shadow-emerald-500/30 animate-bounce">
                      <ArrowRight className="h-10 w-10 rotate-[-45deg]" />
                    </div>
                    <div className="text-xl font-black text-white mt-3">250 METERS</div>
                    <div className="text-xs text-slate-300">Turn Slight Right onto NH44</div>
                  </div>

                  <div className="bg-slate-900/90 rounded-xl p-2.5 text-[11px] text-slate-300 flex justify-between font-mono">
                    <span>ETA: 14:35</span>
                    <span className="text-emerald-400">SPD: 45 km/h</span>
                  </div>
                </div>
                {/* Watch Strap Bottom */}
                <div className="absolute -bottom-10 h-10 w-32 bg-slate-800 rounded-b-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. TOP RATED TOUR GUIDES SECTION                          */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wider mb-2 border border-orange-200/60 dark:border-orange-800/50">
            <Users className="h-3.5 w-3.5 text-orange-500" />
            <span>Local Guardians</span>
          </div>
          <h2 className="section-title">Meet Our Certified Expedition Guides</h2>
          <p className="section-subtitle mt-2">
            Historians, wilderness emergency responders, and storytellers who bring each culture alive
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <div key={guide.id} className="card p-6 flex flex-col items-center text-center">
              <img
                src={guide.photo}
                alt={guide.name}
                width={96}
                height={96}
                loading="lazy"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-emerald-500/20 mb-4 shadow-md"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                {guide.role === 'lead-guide' ? 'Lead Expedition Master' : 'Heritage Guide'}
              </span>
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mt-2">
                {guide.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 mt-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-800 dark:text-slate-200">{guide.rating}</span>
                <span className="text-slate-500 dark:text-slate-400">({guide.totalTours} tours completed)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                {guide.bio}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex flex-wrap justify-center gap-1.5">
                {guide.specialization.slice(0, 2).map((spec, i) => (
                  <span key={i} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. TESTIMONIALS SECTION                                  */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-100/70 dark:bg-[#0D1322] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2 border border-purple-200/60 dark:border-purple-800/50">
              <HeartHandshake className="h-3.5 w-3.5 text-purple-500" />
              <span>Traveller Voices</span>
            </div>
            <h2 className="section-title">Memories From Our Explorers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item) => (
              <div key={item.id} className="card p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic">
                    "{item.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3.5 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <img
                    src={item.photo}
                    alt={item.name}
                    width={44}
                    height={44}
                    loading="lazy"
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      {item.name}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      {item.role} • {item.city}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
