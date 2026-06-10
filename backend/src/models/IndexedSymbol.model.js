import mongoose from 'mongoose';

const indexedSymbolSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    repositoryName: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    symbolName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    symbolType: {
      type: String,
      enum: ['function', 'class', 'export', 'import', 'route'],
      required: true,
      index: true,
    },
    line: {
      type: Number,
      min: 1,
      required: true,
    },
    exportName: {
      type: String,
      default: null,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    indexedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

indexedSymbolSchema.index({ repositoryId: 1, symbolName: 1 });
indexedSymbolSchema.index({ repositoryId: 1, symbolType: 1 });

const IndexedSymbol = mongoose.model('IndexedSymbol', indexedSymbolSchema);
export default IndexedSymbol;
