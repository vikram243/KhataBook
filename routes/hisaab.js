const express = require("express");
const router = express.Router();
const { isLoggedIn} = require("../middlewares/login-middleware");
const { hisaabAccess, deleteAccess, editAccess } = require("../middlewares/access");
const HisaabModel = require("../models/hisaab-model");
const hisaabJoiSchema = require("../models/hisaab-validation");
const UserModel = require("../models/users-model");

router.get("/create", isLoggedIn, function (req, res) {
  let err = req.flash("error");
  res.render("create-hisaab", { error: err });
});

router.post("/create", isLoggedIn, async function (req, res) {
  let { title, description, encrypted, shareable, passcode, editpermissions } =
    req.body;

    const { error } = hisaabJoiSchema.validate(req.body);
    if (error) {
      let err = error.details[0].message;
      req.flash("error", err);
      return res.redirect("/hisaab/create");
    }
    else{
      encrypted = encrypted === "on" ? true : false;
      editpermissions = editpermissions === "on" ? true : false;
      shareable = shareable === "on" ? true : false;
  
      let hisaab = await HisaabModel.create({
        title: title,
        description: description,
        user: req.user.id,
        encrypted: encrypted,
        shareable: shareable,
        passcode: passcode,
        editpermissions: editpermissions,
      });
  
      let user = await UserModel.findOne({ email: req.user.email });
      user.hisaab.push(hisaab._id);
      await user.save();
  
      res.redirect("/profile");
    }
});

router.get("/view/:id", isLoggedIn, async function (req, res) {
  let err = req.flash("error");
  let hisaab = await HisaabModel.findOne({ _id: req.params.id });
  if(hisaab === null) {
    return res.redirect("/profile");
  }

  if (hisaab.encrypted) {
    res.render("passcode", { hisaabid: req.params.id, error: err });
  } else {
    res.render("hisaab", { hisaab });
  }
});

router.post("/:id/verify", async function (req, res) {
  let hisaab = await HisaabModel.findOne({ _id: req.params.id });
  if (hisaab.passcode === req.body.passcode) {
    req.session.hisaabaccess = req.params.id;
    res.redirect(`/hisaab/${req.params.id}`);
  } else {
    req.flash("error", "Paascode is incorrect");
    return res.redirect(`/hisaab/view/${req.params.id}`);
  }
});

router.get("/:id", isLoggedIn, hisaabAccess, async function (req, res) {
  let hisaab = await HisaabModel.findOne({ _id: req.params.id });
  res.render("hisaab", { hisaab });
});

router.get("/delete/:id", isLoggedIn, async function (req, res) {
  let err = req.flash("error");
  let hisaab = await HisaabModel.findOne({ _id: req.params.id});
  if(hisaab === null) {
    return res.redirect("/profile");
  }

  if (hisaab.encrypted) {
    res.render("delPasscode", { hisaabid: req.params.id, error: err  });
  } else {
    await HisaabModel.findOneAndDelete(hisaab);
    res.redirect("/profile");
  }
});

router.post("/:id/verifyDel", async function (req, res) {
  let hisaab = await HisaabModel.findOne({ _id: req.params.id });
  if (hisaab.passcode === req.body.passcode) {
    req.session.deleteaccess = req.params.id;
    res.redirect(`/hisaab/${req.params.id}/delete`);
  } else {
    req.flash("error", "Paascode is incorrect");
    return res.redirect(`/hisaab/delete/${req.params.id}`);
  }
});

router.get("/:id/delete", isLoggedIn, deleteAccess, async function (req, res) {
  await HisaabModel.findOneAndDelete({ _id: req.params.id });
  res.redirect("/profile")
});

router.get("/edit/:id", isLoggedIn, async function (req, res) {
  let err = req.flash("error");
  let hisaab = await HisaabModel.findOne({ _id: req.params.id });
  if(hisaab === null) {
    return res.redirect("/profile");
  }

  if (hisaab.encrypted) {
    res.render("editPasscode", { hisaabid: req.params.id, error: err  });
  } else {
    res.render("edit-hisaab", { hisaabid: req.params.id, hisaab });
  }
});

router.post("/:id/verifyEdit", async function (req, res) {
  let hisaab = await HisaabModel.findOne({ _id: req.params.id });
  if (hisaab.passcode === req.body.passcode) {
    req.session.editaccess = req.params.id;
    res.redirect(`/hisaab/${req.params.id}/edit`);
  } else {
    req.flash("error", "Paascode is incorrect");
    return res.redirect(`/hisaab/edit/${req.params.id}`);
  }
});

router.get("/:id/edit", isLoggedIn, editAccess, async function (req, res) {
  let hisaab = await HisaabModel.findOne({ _id: req.params.id });
  res.render("edit-hisaab", { hisaabid: req.params.id, hisaab });
});

router.post("/:id/update", isLoggedIn, async function (req, res) {
  let { title, description, encrypted, shareable, passcode, editpermissions } =
    req.body;

  try {
    encrypted = encrypted === "on" ? true : false;
    editpermissions = editpermissions === "on" ? true : false;
    shareable = shareable === "on" ? true : false;

    await HisaabModel.findOneAndUpdate({ _id: req.params.id },{
      title: title,
      description: description,
      user: req.user.id,
      encrypted: encrypted,
      shareable: shareable,
      passcode: passcode,
      editpermissions: editpermissions,
    });
    res.redirect("/profile");
  } 
  catch (error) {
    res.send(error.message);
  }
});

module.exports = router;