import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel } from '../../data/hotels';
import { Star, MapPin, ArrowRight, Check } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  return (
    <div className="card-hover group flex flex-col h-full overflow-hidden bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl transition-all duration-300">
      {/* Cover Image Container */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={hotel.images[0]}
          alt={hotel.name}
          width={1200}
          height={800}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white shadow-sm border border-white/20 dark:border-slate-700/50">
            {hotel.type}
          </span>
        </div>

        {/* Location & Rating */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <div className="flex items-center gap-1.5 drop-shadow">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            <span className="truncate max-w-[200px] text-slate-100 font-semibold">{hotel.city}, {hotel.state}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-white">{hotel.ratingsAverage}</span>
            <span className="text-slate-300 text-[11px]">({hotel.ratingsQuantity})</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {hotel.name}
        </h3>

        <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
          {hotel.description}
        </p>

        {/* Amenities Highlights */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {hotel.amenities.slice(0, 3).map((amenity, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60"
            >
              <Check className="h-3 w-3 text-emerald-500" /> {amenity}
            </span>
          ))}
          {hotel.amenities.length > 3 && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 self-center font-medium">
              +{hotel.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">
              Per Night From
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ₹{hotel.price.toLocaleString('en-IN')}
              </span>
              {hotel.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{hotel.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Free cancellation</span>
          </div>

          <Link
            to={`/hotels/${hotel.id}`}
            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 group-hover:scale-105 active:scale-95"
          >
            View Stays <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
