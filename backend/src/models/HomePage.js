const mongoose = require('mongoose');

// Each widget occupies a position in react-grid-layout format:
// x, y = grid coordinates; w, h = width/height in grid units
// config holds widget-specific settings (text, imageUrl, etc.)

const widgetSchema = new mongoose.Schema(
  {
    widgetId: { type: String, required: true, trim: true }, // unique within the layout (uuid)
    type: { type: String, required: true, trim: true },     // matches WidgetRegistry key
    x: { type: Number, required: true, min: 0 },
    y: { type: Number, required: true, min: 0 },
    w: { type: Number, required: true, min: 1 },
    h: { type: Number, required: true, min: 1 },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const brandingSchema = new mongoose.Schema(
  {
    // Navbar
    logoText:            { type: String, default: '', trim: true },
    logoUrl:             { type: String, default: '', trim: true },
    bgColor:             { type: String, default: '#ffffff', trim: true },
    textColor:           { type: String, default: '#111111', trim: true },
    accentColor:         { type: String, default: '#111111', trim: true },
    accentTextColor:     { type: String, default: '#ffffff', trim: true },
    fontFamily:          { type: String, default: 'system', trim: true },
    // Page background
    pageBgType:          { type: String, default: 'solid', enum: ['solid', 'gradient', 'image'] },
    pageBgColor:         { type: String, default: '#f9fafb', trim: true },
    pageBgGradientFrom:  { type: String, default: '#ffffff', trim: true },
    pageBgGradientTo:    { type: String, default: '#f3f4f6', trim: true },
    pageBgGradientDir:   { type: String, default: 'to bottom', trim: true },
    pageBgImage:         { type: String, default: '', trim: true },
    // Cards
    cardRadius:          { type: String, default: 'md', enum: ['none', 'sm', 'md', 'lg', 'xl'] },
    cardShadow:          { type: String, default: 'sm', enum: ['none', 'sm', 'md', 'lg'] },
    cardBg:              { type: String, default: '#ffffff', trim: true },
  },
  { _id: false }
);

const homePageSchema = new mongoose.Schema(
  {
    // unique: true already creates an index; the explicit index() call below is
    // intentionally omitted to avoid duplicate index warnings from MongoDB.
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    widgets: [widgetSchema],
    cols: { type: Number, default: 12, min: 1 },
    branding: { type: brandingSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomePage', homePageSchema);
