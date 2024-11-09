const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/login-middleware");
const { hisaabAccess, deleteAccess, editAccess } = require("../middlewares/access");
const HisaabModel = require("../models/hisaab-model");
const UserModel = require("../models/users-model");

router.get("/create", isLoggedIn, function (req, res) {
  let err = req.flash("error");
  res.render("create-hisaab", { error: err });
});

router.post("/create", isLoggedIn, async function (req, res) {
  let { title, description, encrypted, shareable, passcode, editpermissions } =
    req.body;

  try {
    encrypted = encrypted === "on" ? true : false;
    editpermissions = editpermissions === "on" ? true : false;
    shareable = shareable === "on" ? true : false;

    let hisaab = await HisaabModel.create({
      title: title,
      description: description,
      user: req.user.userid,
      encrypted: encrypted,
      shareable: shareable,
      passcode: passcode,
      editpermissions: editpermissions,
    });

    let user = await UserModel.findOne({ email: req.user.email });
    user.hisaab.push(hisaab._id);
    await user.save();

    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
    req.flash("error", "Title and Description is not allowed to be empty");
    return res.redirect("/hisaab/create");
  }
});

router.get("/view/:id", isLoggedIn, async function (req, res) {
  let err = req.flash("error");
  let hisaab = await HisaabModel.findOne({ _id: req.params.id });
  if (hisaab === null) {
    req.flash("error", "Khata not found");
    res.redirect("/profile");
    return;
  }

  if (hisaab.encrypted) {
    res.render("passcode", { hisaabid: req.params.id, error: err });
    return;
  } else {
    res.render("hisaab", { hisaab, error: err, req });
    return;
  }
});

router.post("/:id/verify", async function (req, res) {
  let hisaab = await HisaabModel.findOne({ _id: req.params.id });
  if (hisaab.passcode === req.body.passcode) {
    req.session.hisaabaccess = req.params.id;
    res.redirect(`/hisaab/${req.params.id}`);
  } else {
    req.flash("error", "Paascode is incorrect");
    res.redirect(`/hisaab/view/${req.params.id}`);
  }
});

router.get("/:id", isLoggedIn, hisaabAccess, async function (req, res) {
  let hisaab = await HisaabModel.findOne({ _id: req.params.id });
  if (hisaab === null) {
    req.flash("error", "Khata not found");
    return res.redirect("/profile");
  }
  res.render("hisaab", { hisaab, req });
});

router.get("/delete/:id", isLoggedIn, async function (req, res) {
  let err = req.flash("error");
  let hisaab = await HisaabModel.findOne({ _id: req.params.id });
  if (hisaab === null) {
    req.flash("error", "Khata not found");
    res.redirect("/profile");
    return;
  }

  if (hisaab.encrypted) {
    res.render("delPasscode", { hisaabid: req.params.id, error: err });
    return;
  }

  if (hisaab.user.toString() === req.user.userid) {
    await HisaabModel.findOneAndDelete(hisaab);
    res.redirect("/profile");
    return;
  }

  else {
    req.flash("error", "You are not authorized to delete this hisaab");
    res.redirect(`/hisaab/view/${req.params.id}`);
    return;
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
  let hisaab = await HisaabModel.findOne({ _id: req.params.id });
  if (hisaab.user.toString() === req.user.userid) {
    await HisaabModel.findOneAndDelete(hisaab);
    res.redirect("/profile");
  }
  else {
    req.flash("error", "You are not authorized to delete this hisaab");
    return res.redirect(`/hisaab/view/${req.params.id}`);
  }
});

router.get("/edit/:id", isLoggedIn, async function (req, res) {
  let err = req.flash("error");
  let hisaab = await HisaabModel.findOne({ _id: req.params.id });
  if (hisaab === null) {
    req.flash("error", "Khata not found");
    res.redirect("/profile");
    return;
  }
  if (hisaab.editpermissions === false) {
    req.flash("error", "This hisaab has not edit permissions");
    res.redirect("/profile");
    return;
  }
  if (hisaab.encrypted) {
    res.render("editPasscode", { hisaabid: req.params.id, error: err });
    return;
  }
  if (hisaab.user.toString() === req.user.userid) {
    res.render("edit-hisaab", { hisaabid: req.params.id, hisaab });
    return;
  }
  else {
    req.flash("error", "You are not authorized to edit this hisaab");
    res.redirect(`/hisaab/view/${req.params.id}`);
    return;
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
  if (hisaab.user.toString() === req.user.userid) {
    res.render("edit-hisaab", { hisaabid: req.params.id, hisaab });
  }
  else {
    req.flash("error", "You are not authorized to edit this hisaab");
    return res.redirect(`/hisaab/view/${req.params.id}`);
  }
});

router.post("/:id/update", isLoggedIn, async function (req, res) {
  let { title, description, encrypted, shareable, passcode, editpermissions } =
    req.body;

  try {
    encrypted = encrypted === "on" ? true : false;
    editpermissions = editpermissions === "on" ? true : false;
    shareable = shareable === "on" ? true : false;

    await HisaabModel.findOneAndUpdate({ _id: req.params.id }, {
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
    return;
  }
});

module.exports = router;
