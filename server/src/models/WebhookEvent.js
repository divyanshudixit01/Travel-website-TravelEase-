import mongoose from 'mongoose';

const WebhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      default: '',
      index: true,
    },
    orderId: {
      type: String,
      default: '',
      index: true,
    },
    bookingId: {
      type: String,
      default: '',
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.WebhookEvent || mongoose.model('WebhookEvent', WebhookEventSchema);
