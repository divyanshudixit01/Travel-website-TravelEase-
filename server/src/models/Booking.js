import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    customerEmail: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      default: '',
    },
    serviceType: {
      type: String,
      required: true,
      enum: ['flight', 'hotel', 'train', 'bus', 'car-rental', 'cab', 'homestay', 'tour', 'ai-itinerary'],
    },
    provider: {
      type: String,
      default: 'TravelEase Direct', // e.g. 'Uber', 'Rapido', 'Bharat Taxi', 'IRCTC', 'LiteAPI'
    },
    serviceTitle: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    amountUSD: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled', 'Completed', 'Pending'],
      default: 'Confirmed',
    },
    paymentMethod: {
      type: String,
      default: 'Instant Pay',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Refunded', 'Failed'],
      default: 'Paid',
    },
    image: {
      type: String,
      default: '',
    },
    qrCodeData: {
      type: String,
      default: '',
    },
    gstDetails: {
      companyName: { type: String, default: '' },
      gstin: { type: String, default: '' },
      companyAddress: { type: String, default: '' },
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    convenienceFee: {
      type: Number,
      default: 0,
    },
    fareBreakdown: {
      baseFare: { type: Number, default: 0 },
      taxesAndGst: { type: Number, default: 0 },
      discounts: { type: Number, default: 0 },
      convenienceFee: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
