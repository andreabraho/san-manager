const mongoose = require('mongoose');

// Superadmin can enable or disable widget types platform-wide
const widgetTypeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true }, // matches frontend WidgetRegistry key
    label: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    isEnabled: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WidgetType', widgetTypeSchema);
