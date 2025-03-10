const express = require("express");
const router = express.Router();
const { fetchHisaab, validateObjectId, isLoggedIn } = require("../middlewares/middleware");
const { hisaabAccess, deleteAccess, editAccess } = require("../middlewares/access");
const HisaabModel = require("../models/hisaab-model");
const UserModel = require("../models/users-model");

router.get("/create", isLoggedIn, (req, res) => {
  res.render("create-hisaab", { error: req.flash("error") || null });
});

router.post("/create", isLoggedIn, async (req, res) => {
  try {
    let { title, description, encrypted, shareable, passcode, editpermissions } = req.body;

    // Convert checkbox values to boolean
    encrypted = encrypted === "on" ? true : false;
    editpermissions = editpermissions === "on" ? true : false;
    shareable = shareable === "on" ? true : false;

    // Create Hisaab document
    const hisaab = await HisaabModel.create({
      title,
      description,
      user: req.user.userid,
      encrypted,
      shareable,
      passcode,
      editpermissions,
    });

    // Find user and update in parallel
    const user = await UserModel.findOne({ email: req.user.email });
    if (user) {
      user.hisaab.push(hisaab._id);
      await user.save();
    }

    res.redirect("/profile");
  } catch (error) {
    console.error("Error creating Hisaab:", error.message);
    req.flash("error", "Title and description cannot be empty");
    res.redirect("/hisaab/create");
  }
});

router.get("/view/:id", isLoggedIn, validateObjectId, async (req, res) => {
  const err = req.flash("error");
  const hisaab = await fetchHisaab(req.params.id, req, res);
  if (!hisaab) return; // Redirect handled in function

  if (hisaab.encrypted) {
    return res.render("passcode", { hisaabid: req.params.id, error: err });
  }

  res.render("hisaab", { hisaab, error: err, req });
});

router.post("/:id/verify", validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const { passcode } = req.body;

    // Fetch Hisaab document
    const hisaab = await fetchHisaab(req.params.id, req, res);
    if (!hisaab) return; // Redirect handled in function

    // Check passcode
    if (hisaab.passcode === passcode) {
      req.session.hisaabaccess = id;
      return res.redirect(`/hisaab/${id}`);
    }

    req.flash("error", "Passcode is incorrect");
    res.redirect(`/hisaab/view/${id}`);
  } catch (error) {
    console.error("Error verifying passcode:", error.message);
    req.flash("error", "Something went wrong, please try again");
    res.redirect("/profile");
  }
});

router.get("/:id", isLoggedIn, hisaabAccess, validateObjectId, async (req, res) => {
  try {
    // Fetch Hisaab document
    const hisaab = await fetchHisaab(req.params.id, req, res);
    if (!hisaab) return; // Redirect handled in function

    res.render("hisaab", { hisaab, req });
  } catch (error) {
    console.error("Error fetching Khata:", error.message);
    req.flash("error", "Something went wrong, please try again");
    res.redirect("/profile");
  }
});

router.get("/delete/:id", isLoggedIn, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const err = req.flash("error");

    // Fetch Hisaab document
    const hisaab = await fetchHisaab(req.params.id, req, res);
    if (!hisaab) return; // Redirect handled in function

    // If encrypted, ask for passcode
    if (hisaab.encrypted) {
      return res.render("delPasscode", { hisaabid: id, error: err });
    }

    // Check if the logged-in user is the owner
    if (hisaab.user.toString() === req.user.userid) {
      await HisaabModel.findByIdAndDelete(id);
      return res.redirect("/profile");
    }

    // Unauthorized deletion attempt
    req.flash("error", "You are not authorized to delete this hisaab");
    res.redirect(`/hisaab/view/${id}`);
  } catch (error) {
    console.error("Error deleting Khata:", error.message);
    req.flash("error", "Something went wrong, please try again");
    res.redirect("/profile");
  }
});

router.post("/:id/verifyDel", validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const { passcode } = req.body;

    // Fetch Hisaab document
    const hisaab = await fetchHisaab(req.params.id, req, res);
    if (!hisaab) return; // Redirect handled in function

    // Verify passcode
    if (hisaab.passcode === passcode) {
      req.session.deleteaccess = id;
      return res.redirect(`/hisaab/${id}/delete`);
    }

    req.flash("error", "Passcode is incorrect");
    res.redirect(`/hisaab/delete/${id}`);
  } catch (error) {
    console.error("Error verifying delete passcode:", error.message);
    req.flash("error", "Something went wrong, please try again");
    res.redirect("/profile");
  }
});

router.get("/:id/delete", isLoggedIn, validateObjectId, deleteAccess, async (req, res) => {
  const hisaab = await fetchHisaab(req.params.id, req, res);
  if (!hisaab) return;

  if (hisaab.user.toString() === req.user.userid) {
    await HisaabModel.findByIdAndDelete(req.params.id);
    return res.redirect("/profile");
  }

  req.flash("error", "You are not authorized to delete this hisaab");
  res.redirect(`/hisaab/view/${req.params.id}`);
});

router.get("/edit/:id", isLoggedIn, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const err = req.flash("error");

    // Fetch Hisaab document
    const hisaab = await fetchHisaab(req.params.id, req, res);
    if (!hisaab) return; // Redirect handled in function

    // Check edit permissions
    if (!hisaab.editpermissions) {
      req.flash("error", "This hisaab does not have edit permissions");
      return res.redirect("/profile");
    }

    // If encrypted, ask for passcode
    if (hisaab.encrypted) {
      return res.render("editPasscode", { hisaabid: id, error: err });
    }

    // Check if the logged-in user is the owner
    if (hisaab.user.toString() === req.user.userid) {
      return res.render("edit-hisaab", { hisaabid: id, hisaab });
    }

    // Unauthorized access
    req.flash("error", "You are not authorized to edit this hisaab");
    res.redirect(`/hisaab/view/${id}`);
  } catch (error) {
    console.error("Error fetching Khata for edit:", error.message);
    req.flash("error", "Something went wrong, please try again");
    res.redirect("/profile");
  }
});

router.post("/:id/verifyEdit", validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const { passcode } = req.body;

    // Fetch Hisaab document
    const hisaab = await fetchHisaab(req.params.id, req, res);
    if (!hisaab) return; // Redirect handled in function

    // Verify passcode
    if (hisaab.passcode === passcode) {
      req.session.editaccess = id;
      return res.redirect(`/hisaab/${id}/edit`);
    }

    req.flash("error", "Passcode is incorrect");
    res.redirect(`/hisaab/edit/${id}`);
  } catch (error) {
    console.error("Error verifying edit passcode:", error.message);
    req.flash("error", "Something went wrong, please try again");
    res.redirect("/profile");
  }
});

router.get("/:id/edit", isLoggedIn, validateObjectId, editAccess, async (req, res) => {
  const hisaab = await fetchHisaab(req.params.id, req, res);
  if (!hisaab) return;

  if (hisaab.user.toString() === req.user.userid) {
    return res.render("edit-hisaab", { hisaabid: req.params.id, hisaab });
  }

  req.flash("error", "You are not authorized to edit this hisaab");
  res.redirect(`/hisaab/view/${req.params.id}`);
});

router.post("/:id/update", isLoggedIn,validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    let { title, description, encrypted, shareable, passcode, editpermissions } = req.body;

    // Convert checkbox values to boolean
    encrypted = encrypted === "on" ? true : false;
    editpermissions = editpermissions === "on" ? true : false;
    shareable = shareable === "on" ? true : false;

    // Find and update the document
    const hisaab = await HisaabModel.findByIdAndUpdate(
      id,
      { $set: { title, description, encrypted, shareable, passcode, editpermissions } },
      { new: true, runValidators: true }
    );

    // Check if Hisaab exists
    if (!hisaab) {
      req.flash("error", "Khata not found");
      return res.redirect("/profile");
    }

    res.redirect("/profile");
  } catch (error) {
    console.error("Error updating Khata:", error.message);
    req.flash("error", "Something went wrong, please try again");
    res.redirect(`/hisaab/${req.params.id}/edit`);
  }
});

module.exports = router;