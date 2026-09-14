import mongoose from 'mongoose';

const dayItemSchema = new mongoose.Schema({
  time: { type: String, required: true },
  type: { type: String, enum: ['stay', 'flight', 'activity', 'transport'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  priceUSD: { type: Number, default: 0 },
  refId: { type: String }
});

const daySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  title: { type: String, required: true },
  items: [dayItemSchema]
});

const itinerarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    destination: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    pax: { type: Number, default: 2 },
    budgetUSD: { type: Number },
    status: { type: String, enum: ['draft', 'booked', 'partial'], default: 'draft' },
    days: [daySchema],
    totalPackageUSD: { type: Number, required: true },
    aiPrompt: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Itinerary', itinerarySchema);
