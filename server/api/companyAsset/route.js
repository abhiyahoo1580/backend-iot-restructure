const express = require("express");
const router = express.Router({ mergeParams: true });
const controller = require('./controller');

function getLcdView(req, res) {
  controller.getLcdView(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  })
}
// getLcdViewForSheela

function getLcdViewForSheela(req, res) {
  controller.getLcdViewForSheela(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  })
}
// getLcdViewForPai
function getLcdViewForPai(req, res) {
  controller.getLcdViewForPai(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  })
}


function getAllMeters(req, res) {
  controller.getAllMeters(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  })
}
// getAllMetersHirarchi
function getAllMetersHirarchi(req, res) {
  controller.getAllMetersHirarchi(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  })
}

function getAllStatus(req, res) {
  controller.getAllStatus(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  })
}

// getAllStatusOfMappedDevice
function getAllStatusOfMappedDevice(req, res) {
  controller.getAllStatusOfMappedDevice(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  })
}
function getAllAssetDropDown(req, res) {
  controller.getAllAssetDropDown(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  })
}
function getSummaryData(req, res) {
  controller.getSummaryData(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });


  });
}

function getDeviceType(req, res) {
  controller.getDeviceType(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  })
}

function getAssetByDeviceType(req, res) {
  controller.getAssetByDeviceType(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  })
}

function getAllDevices(req, res) {
  controller.getDeviceTypes(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  })
}

function getAllDeviceParameters(req, res) {
  controller.getAllDeviceParameters(req).then((response) => {
    res.status(200).send(response);

  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  });
}

function getParameterListByAssetID(req, res) {
  controller.getParameterListByAssetID(req).then((response) => {
    res.status(200).send(response);

  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  });
}

function getGroupGraph(req, res) {
  controller.getGroupGraph(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  })
}

// getRegiterDetailsAllAsset

function getRegiterDetailsAllAsset(req, res) {
  controller.getRegiterDetailsAllAsset(req).then((response) => {
    res.status(200).send(response);
  }).catch((error) => {
    if (error.name === "ValidationError") {
      let errors = {};

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      console.log(errors)
      res.status(400).send(errors);
    }
    res.status(500).send({ msg: 'error occured' });

  })
}


router.get('/get', getAllMeters);
router.get('/hirarchi/get', getAllMetersHirarchi);
router.get('/list/get', getAllDevices);
router.get('/bydevicetype/get', getAssetByDeviceType);
router.get('/devicetype/get', getDeviceType);
router.get('/all/status/get', getAllStatus);
router.get('/all/status/get/byCustomerId/:id', getAllStatusOfMappedDevice);
router.get('/all/dropdown/get', getAllAssetDropDown);
router.get('/summarydata/get', getSummaryData);
// need to move in company_module
router.get('/company/parameters/list/get', getAllDeviceParameters);
router.get('/parameters/list/get', getParameterListByAssetID);
router.get('/lcd/view/get', getLcdView);
router.get('/lcd/view/sheela/get', getLcdViewForSheela);
router.get('/lcd/view/pai/get', getLcdViewForPai);
router.get('/group/graph/get', getGroupGraph);
router.get('/register/details/all/get', getRegiterDetailsAllAsset);
module.exports = router
