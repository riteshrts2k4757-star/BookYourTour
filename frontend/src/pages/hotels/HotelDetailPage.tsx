import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { hotelService } from '../../services/mock/hotelService';
import { reviewService } from '../../services/mock/reviewService';
import { bookingService } from '../../services/mock/bookingService';
import { Hotel, HotelRoom } from '../../data/hotels';
import { Review } from '../../data/reviews';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DemoPaymentModal } from '../../components/modals/DemoPaymentModal';
import { BookingSuccessModal } from '../../components/modals/BookingSuccessModal';
import { Booking } from '../../data/bookings';
import {
  Star,
  MapPin,
  Calendar,
  Users,
  Check,
  Shield,
  Share2,
  ArrowRight,
  Building,
  BedDouble,
  Maximize2,
  Clock,
  Sparkles
} from 'lucide-react';

export const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState<string>('');

  // Booking details state
  const [checkInDate, setCheckInDate] = useState('2027-02-15');
  const [checkOutDate, setCheckOutDate] = useState('2027-02-17');
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [roomsCount, setRoomsCount] = useState(1);

  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Review state
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      const data = await hotelService.getById(id);
      if (data) {
        setHotel(data);
        setActiveImage(data.images[0]);
        if (data.rooms && data.rooms.length > 0) {
          setSelectedRoom(data.rooms[0]);
        }
        const revs = await reviewService.getByTarget(data.id);
        setReviews(revs);
      }
      setLoading(false);
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="h-10 w-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading property sanctuary...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Property Not Found</h2>
        <p className="text-slate-500 text-sm mt-2">The selected hotel or resort could not be found.</p>
        <Link to="/hotels" className="mt-6 inline-block btn-primary text-xs font-bold py-2.5 px-6">
          Browse All Hotels
        </Link>
      </div>
    );
  }

  // Calculate nights
  const d1 = new Date(checkInDate);
  const d2 = new Date(checkOutDate);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const roomPrice = selectedRoom ? selectedRoom.price : hotel.price;
  const totalAmount = roomPrice * nights * roomsCount;

  const handleStartBooking = () => {
    if (!selectedRoom) {
      showToast('Please select a room category.', 'error');
      return;
    }
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async (txnId: string) => {
    setIsPaymentOpen(false);
    const newBk = await bookingService.create({
      userId: user?.id || 'guest-user',
      type: 'hotel',
      itemId: hotel.id,
      itemName: `${hotel.name} (${selectedRoom?.name || 'Deluxe Room'})`,
      status: 'confirmed',
      paymentStatus: 'paid',
      amount: totalAmount,
      date: checkInDate,
      travellers: guestCount,
      details: {
        txnId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        roomsCount,
        roomName: selectedRoom?.name
      }
    });
    setConfirmedBooking(newBk);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    const added = await reviewService.addReview({
      userId: user?.id || 'user-1',
      userName: user?.name || 'Aarav Sharma',
      userPhoto: user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      targetType: 'hotel',
      targetId: hotel.id,
      targetName: hotel.name,
      rating: reviewRating,
      review: reviewText
    });
    setReviews([added, ...reviews]);
    setReviewText('');
    showToast('Your stay review has been shared!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-slate-900 dark:text-white">Home</Link>
            <span>/</span>
            <Link to="/hotels" className="hover:text-slate-900 dark:text-white">Hotels</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{hotel.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                showToast('Hotel link copied to clipboard!', 'info');
              }}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Title Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="badge-navy uppercase tracking-wider">{hotel.type}</span>
            <div className="flex items-center gap-1 text-xs text-slate-600 ml-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-900">{hotel.ratingsAverage}</span>
              <span className="text-slate-400">({hotel.ratingsQuantity} verified guest reviews)</span>
            </div>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {hotel.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-teal-600" />
            {hotel.address}
          </p>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-12">
          <div className="lg:col-span-3 h-[380px] sm:h-[460px] rounded-3xl overflow-hidden bg-slate-900 shadow-md">
            <img src={activeImage} alt={hotel.name} className="h-full w-full object-cover" />
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 h-[120px] lg:h-[460px]">
            {hotel.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`relative rounded-2xl overflow-hidden h-full border-2 transition ${
                  activeImage === img ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Details */}
          <div className="lg:col-span-8 space-y-10">
            {/* Overview */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-3">
                Property Overview
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {hotel.description}
              </p>
            </div>

            {/* Room Categories Selector */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-teal-600" /> Available Room Options
              </h3>
              <div className="space-y-4">
                {hotel.rooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col md:flex-row gap-5 items-start md:items-center justify-between ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/20 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex gap-4 items-center">
                        <img
                          src={room.image}
                          alt={room.name}
                          className="h-20 w-24 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                              {room.name}
                            </h4>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {room.type}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                            <span><BedDouble className="h-3.5 w-3.5 inline mr-1 text-slate-400" />{room.beds}</span>
                            <span><Maximize2 className="h-3.5 w-3.5 inline mr-1 text-slate-400" />{room.size}</span>
                            <span><Users className="h-3.5 w-3.5 inline mr-1 text-slate-400" />Up to {room.capacity} Guests</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {room.amenities.map((a, i) => (
                              <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full md:w-auto md:flex-col md:items-end gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-xl font-black text-slate-900 dark:text-white block">
                            ₹{room.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-slate-400">/ night</span>
                        </div>
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                            isSelected
                              ? 'bg-teal-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ Selected' : 'Choose Room'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-4">
                Amenities & Facilities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hotel.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <Check className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies & Nearby */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-3">Check-in & Policies</h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Check-in Time:</span>
                    <strong>{hotel.checkIn}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out Time:</span>
                    <strong>{hotel.checkOut}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancellation:</span>
                    <strong className="text-teal-700 text-right">{hotel.cancellation}</strong>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-3">Nearby Attractions</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {hotel.nearbyAttractions.map((att, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{att.name}</span>
                      <strong className="text-slate-400">{att.distance}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-6">
                Guest Reviews ({reviews.length})
              </h3>

              {/* Add review form */}
              <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Write a Demo Property Review</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-slate-500">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-0.5 text-amber-400"
                    >
                      <Star className={`h-4 w-4 ${star <= reviewRating ? 'fill-current' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of your stay..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                  rows={3}
                  required
                />
                <button type="submit" className="mt-2 btn-primary text-xs py-2 px-4 font-bold">
                  Post Demo Review
                </button>
              </form>

              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-white border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <img src={r.userPhoto} alt="" className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <strong className="text-xs text-slate-800 block">{r.userName}</strong>
                          <span className="text-[10px] text-slate-400">{r.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(r.rating)].map((_, idx) => (
                          <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.review}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sticky Booking Panel */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Nightly Rate
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    ₹{roomPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500">/ night</span>
                </div>
                <span className="text-[11px] text-teal-600 font-medium">Selected: {selectedRoom?.name}</span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Check-in</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Check-out</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              {/* Rooms & Guests */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Rooms</label>
                  <select
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(Number(e.target.value))}
                    className="input-field text-xs"
                  >
                    <option value={1}>1 Room</option>
                    <option value={2}>2 Rooms</option>
                    <option value={3}>3 Rooms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Guests</label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="input-field text-xs"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4+ Guests</option>
                  </select>
                </div>
              </div>

              {/* Cost Calculation */}
              <div className="py-3 border-y border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>₹{roomPrice.toLocaleString('en-IN')} × {nights} Night{nights > 1 ? 's' : ''}:</span>
                  <strong>₹{(roomPrice * nights).toLocaleString('en-IN')}</strong>
                </div>
                {roomsCount > 1 && (
                  <div className="flex justify-between">
                    <span>Rooms Multiplier:</span>
                    <span>× {roomsCount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Service Tax & GST:</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100">
                  <span>Total Payable:</span>
                  <span className="text-teal-700 text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartBooking}
                className="w-full btn-primary py-3.5 text-sm font-bold shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2"
              >
                Reserve Stay Now <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Shield className="h-3.5 w-3.5 text-teal-600" />
                <span>Zero Risk • Instant Demo Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DemoPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={totalAmount}
        itemName={`${hotel.name} - ${selectedRoom?.name}`}
        itemType="Hotel Reservation"
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={(reason) => showToast(`Payment failed: ${reason}`, 'error')}
      />

      {confirmedBooking && (
        <BookingSuccessModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
        />
      )}
    </div>
  );
};

