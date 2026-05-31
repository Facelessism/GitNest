import mongoose from 'mongoose';

const branchProtectionRuleSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    branchPattern: {
      type: String,
      required: [true, 'Branch pattern is required'],
      trim: true,
    },
    requirePullRequest: {
      type: Boolean,
      default: true,
    },
    requiredApprovalsCount: {
      type: Number,
      default: 1,
      min: 0,
    },
    requireStatusChecks: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

branchProtectionRuleSchema.index(
  { repositoryId: 1, branchPattern: 1 },
  { unique: true }
);

const BranchProtectionRule = mongoose.model(
  'BranchProtectionRule',
  branchProtectionRuleSchema
);

export default BranchProtectionRule;
