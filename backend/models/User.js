import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['interviewer', 'interviewee'],
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    // Interviewer-specific fields
    yearsOfExperience: {
      type: Number,
      required: function () {
        return this.role === 'interviewer';
      },
    },
    domains: {
      type: [String],
      required: function () {
        return this.role === 'interviewer';
      },
    },
    availabilityRadius: {
      type: Number,
      default: 5, // km
    },
    // Interviewee-specific fields
    currentStatus: {
      type: String,
      enum: ['student', 'professional'],
      required: function () {
        return this.role === 'interviewee';
      },
    },
    yearOfStudy: {
      type: Number,
      required: function () {
        return this.role === 'interviewee' && this.currentStatus === 'student';
      },
    },
    domain: {
      type: String,
      required: function () {
        return this.role === 'interviewee' && this.currentStatus === 'professional';
      },
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location queries
userSchema.index({ location: '2dsphere' });
// Note: email index is automatically created by unique: true
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;

