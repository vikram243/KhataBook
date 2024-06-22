function hisaabAccess(req, res, next) {
    if (req.session.hisaabaccess === req.params.id) {
      next();
    } else {
      res.redirect(`/hisaab/view/${req.params.id}`);
    }
  }
  
  function deleteAccess(req, res, next) {
    if (req.session.deleteaccess === req.params.id) {
      next();
    } else {
      res.redirect(`/hisaab/delete/${req.params.id}`);
    }
  }

  function editAccess(req, res, next) {
    if (req.session.editaccess === req.params.id) {
      next();
    } else {
      res.redirect(`/hisaab/edit/${req.params.id}`);
    }
  }  
  
  module.exports.editAccess = editAccess;
  module.exports.hisaabAccess = hisaabAccess;
  module.exports.deleteAccess = deleteAccess;  
