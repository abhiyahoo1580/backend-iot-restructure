const mongoose = require('mongoose');
const { Schema } = mongoose;
const parametersValueSchema = new Schema({
    CompanyId: { type: Number, required: [true, "CompanyId is required"] },
    AssetId: { type: String, required: [true, "AssetId is required"] },
    Parameter: { type: Number, required: [true, "Parameter is required"] },
    RegisterId: { type: Number, required: [true, "RegisterId is required"] },
    upperThresholdValue: {
        type: Number, validate() {
            if (!this.upperThresholdValue && !this.lowerThresholdValue && !this.upperThresholdWarning && !this.lowerThresholdWarning) {
                throw new Error("Atleast one Threshold value must be specified")
            }
        }
    },
    lowerThresholdValue: {
        type: Number, validate() {
            if (!this.upperThresholdValue && !this.lowerThresholdValue && !this.upperThresholdWarning && !this.lowerThresholdWarning) {
                throw new Error("Atleast one Threshold value must be specified")
            }
        }
    },
    lowerThresholdWarning: {
        type: Number, validate() {
            if (!this.upperThresholdValue && !this.lowerThresholdValue && !this.upperThresholdWarning && !this.lowerThresholdWarning) {
                throw new Error("Atleast one Threshold value must be specified")
            }
        }
    },
    upperThresholdWarning: {
        type: Number, validate() {
            if (!this.upperThresholdValue && !this.lowerThresholdValue && !this.upperThresholdWarning && !this.lowerThresholdWarning) {
                throw new Error("Atleast one Threshold value must be specified")
            }
        }
    },

});
parametersValueSchema.index({ CompanyId: 1, AssetId: 1, Parameter: 1, RegisterId: 1 }, { unique: true });
parametersValueSchema.index({ CompanyId: 1 });
parametersValueSchema.index({ AssetId: 1 });
parametersValueSchema.index({ Parameter: 1 });
parametersValueSchema.index({ RegisterId: 1 });

var alertConfigData = mongoose.model("parametersValue", parametersValueSchema);

module.exports = alertConfigData;