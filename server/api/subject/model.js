const mongoose = require('mongoose');
const { Schema } = mongoose;
const subjectSchema = new Schema({
  subjectName: { type: String },  // Inline index
  isDeleted: { type: Boolean, default: false }
});
subjectSchema.index({ subjectName: 1, isDeleted: 1 });
var subjectData = mongoose.model("subject",subjectSchema);

module.exports = subjectData;