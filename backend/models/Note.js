import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ sessionId: 1, authorId: 1 });
noteSchema.index({ sessionId: 1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;

