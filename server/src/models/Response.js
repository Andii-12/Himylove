const { Schema, model } = require('mongoose');

const responseSchema = new Schema(
  {
    answer: {
      type: String,
      enum: ['yes', 'no', 'maybe'],
      default: 'yes',
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    prompt: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = model('Response', responseSchema);

