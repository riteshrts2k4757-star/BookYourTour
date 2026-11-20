import React from 'react';
import { Link } from 'react-router-dom';
import { Tour } from '../../data/tours';
import { useAuth } from '../../context/AuthContext';
import { Star, Clock, Users, MapPin, Heart, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../services/apiClient';

interface TourCardProps {
  tour: Tour;
}

export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const { user, toggleWishlist, isWishlisted } = useAuth();
  const { showToast } = useToast();
  const wishlisted = isWishlisted(tour.id);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Sign in to save tours to your wishlist.', 'info');
      return;
    }
    if (!/^[a-f\d]{24}$/i.test(tour.id)) {
      showToast('This tour is not linked to the live tour catalog.', 'error');
      return;
    }
    try {
      await toggleWishlist(tour.id);
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Wishlist could not be updated.'), 'error');
    }
  };

  const discountPercent = tour.priceDiscount
    ? Math.round(((tour.price - tour.priceDiscount) / tour.price) * 100)
    : 0;

  return (
    <div className="card-hover group flex flex-col h-full overflow-hidden bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl transition-all duration-300">
      {/* Cover Image Container */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={tour.imageCover}
          alt={tour.name}
          width={1200}
          height={800}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />

        {/* Category Pill & Discount Badge */}
        <div className="absolute top-3 left-3 flex gap-2 items-center">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white shadow-sm border border-white/20 dark:border-slate-700/50">
            {tour.category}
          </span>
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-sm shadow-orange-500/30">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(event) => void handleWishlist(event)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-md cursor-pointer ${
            wishlisted
              ? 'bg-rose-500 text-white scale-110'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:text-rose-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Image Info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <div className="flex items-center gap-1.5 drop-shadow">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            <span className="truncate max-w-[200px] text-slate-100 font-semibold">{tour.startLocation.description}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-white">{tour.ratingsAverage}</span>
            <span className="text-slate-300 text-[11px]">({tour.ratingsQuantity})</span>
          </div>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {tour.name}
        </h3>

        <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed font-normal">
          {tour.summary}
        </p>

        {/* Metadata Chips */}
        <div className="flex items-center gap-4 mt-4 py-3 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>{tour.duration} Days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Max {tour.maxGroupSize}</span>
          </div>
          <div className="ml-auto font-bold capitalize text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-200/60 dark:border-orange-800/50 text-[11px]">
            {tour.difficulty}
          </div>
        </div>

        {/* Price & CTA Footer */}
        <div className="mt-4 pt-1 flex items-end justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">
              Starting From
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ₹{(tour.priceDiscount || tour.price).toLocaleString('en-IN')}
              </span>
              {tour.priceDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{tour.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">per person / all inclusive</span>
          </div>

          <Link
            to={`/tours/${tour.id}`}
            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 group-hover:scale-105 active:scale-95"
          >
            Explore <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
