function accessControl(accessType, redirectPath) {
  return (req, res, next) => {
    if (req.session[accessType] === req.params.id) {
      return next();
    }
    res.redirect(`${redirectPath}/${req.params.id}`);
  };
}

module.exports = {
  hisaabAccess: accessControl("hisaabaccess", "/hisaab/view"),
  deleteAccess: accessControl("deleteaccess", "/hisaab/delete"),
  editAccess: accessControl("editaccess", "/hisaab/edit"),
};