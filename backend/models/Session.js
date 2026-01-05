import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    intervieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    scheduledAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    recordingEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ intervieweeId: 1, status: 1 });
sessionSchema.index({ interviewerId: 1, status: 1 });
sessionSchema.index({ status: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;

