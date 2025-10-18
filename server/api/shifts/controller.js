const shiftData = require("./model");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

async function checkExistingShift(companyId, shift, id = null) {
  // console.log(shift)
  let status = false;
  const existshift = await shiftData.aggregate([
    { $match: { companyId: companyId } },
  ]);
  if (existshift.length == 0) {
    return false;
  }
  let shiftStartTime = shift.start.hour * 60 + shift.start.min;
  let shiftEndTime = shift.end.hour * 60 + shift.end.min;
  await existshift?.forEach((ele) => {
     ele.shifts?.forEach((element) => {
         let elementStartTime = element.start.hour * 60 + element.start.min;
         let elementEndTime = element.end.hour * 60 + element.end.min;
         console.log(element._id.equals(id)  )
         if ( shiftStartTime >= elementStartTime && shiftStartTime <= elementEndTime && !element._id.equals(id) ) {
       
          return (status = true);}
         else if ( shiftEndTime >= elementStartTime && shiftEndTime <= elementEndTime  && !element._id.equals(id) ) 
            {
            
          return (status = true);
                      }
    });
  });
  return status;
}

async function insertShift(req) {

  try {

    const status = await checkExistingShift(
      req.body.companyId,
      req.body.shifts
    );
    const shift = new shiftData(req.body);
    if (status) {
      return {
        msg: "shift overlapping existing shift sets",
      };
    } else {
      let updatedshift = await shiftData.updateOne({ companyId: req.body.companyId }, {
        $push: {
          "shifts": req.body.shifts,
        }
      }, { upsert: true })

      // console.log(updatedshift)
      return {
        msg: "successfully inserted",
      };
    }
  } catch (error) {
    console.log("error in insertshift", error);
    return Promise.reject(error);
  }
}

async function getShift(req) {

  try {
    const getAllshift = req.params.id
      ? await shiftData.find({ _id: req.params.id })
      : req.query.companyId ? await shiftData.find({ companyId: req.query.companyId })
        : await shiftData.find({});
    return {
      msg: "successfully Find",
      data: getAllshift,
    };
  } catch (error) {
    console.log("error occure in get shift", error);
    return Promise.reject("error occure in get shift");
  }
}

async function updateShift(req) {
  
  try {
    const shiftId = ObjectId(req.params.id);
    // console.log(typeof shiftId);
    const status = await checkExistingShift(
      req.body.companyId,
      req.body.shifts, shiftId
    );
    const shift = new shiftData(req.body);
    if (status) {
      return {
        msg: "shift overlapping existing shift sets",
      };
    } else {
      let updatedshift = await shiftData.updateOne({ 'companyId': req.body.companyId,'shifts._id' : shiftId}, {
        $set:{ "shifts.$.start": req.body.shifts.start ,"shifts.$.end": req.body.shifts.end } }
        );
     
      // console.log(updatedshift);
      if (updatedshift != null) {
        return {
          msg: "Updated Successfully",
          id: updatedshift.id,
        };
      } else {
        return {
          msg: "shift not exist",
        };
      }
    }
  } catch (error) {
    console.log("error occure in updateshift", error);
    return Promise.reject("error occure in updateshift");
  }
}

async function deleteShift(req) {
  // console.log("deleteshift hitt");
  try {
    const shiftId = ObjectId(req.params.id);
    const companyId = Number(req.params.companyId);
    // console.log("shiftId", shiftId);
    // console.log(typeof shiftId,typeof companyId);
    // const deletedshift = await shiftData.findByIdAndDelete(shiftId);
    const deletedshift = await shiftData.update(
      { companyId : companyId},
      {
          $pull: {
            shifts: { _id: shiftId }
          }
      },
      { multi:true }
  )
    return {
      msg: "Deleted successfully ",
    };
  } catch (error) {
    console.log("error occure in deleteshift", error);
    return Promise.reject("error occure in deleteshift");
  }
}

module.exports = {
  insertShift,
  getShift,
  updateShift,
  deleteShift,
};
