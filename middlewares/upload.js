export const handleImageUpload = (fieldName) => (req, res, next) => {
    upload.array(fieldName)(req, res, (err) => {
      if (err) {
        return next(new AppError(err.message, 400));
      }
      
      if (req.files) {
        req.body.images = req.files.map(file => 
          `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
        );
      }
      next();
    });
  };