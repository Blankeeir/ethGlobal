// src/models/Message.ts
import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  filecoinCID: String,
  chainId: String,
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  metadata: {
    type: Map,
    of: String
  }
}, { timestamps: true });

export const Message = mongoose.model('Message', MessageSchema);