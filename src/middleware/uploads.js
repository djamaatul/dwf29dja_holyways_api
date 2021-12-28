const multer = require('multer');

exports.uploads = (fieldName) => {
	const storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, 'assets');
		},
		filename: function (req, file, cb) {
			cb(null, Date.now() + '_' + file.originalname.replace(/\s/g, ''));
		},
	});
	const fileFilter = (req, file, cb) => {
		if (file.fieldname == fieldName) {
			if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|svg|SVG)$/)) {
				req.fileValidationError = { message: 'cant upload except image' };
				return cb(null, false);
			}
			return cb(null, true);
		}
	};
	const upload = multer({
		storage,
		fileFilter,
		limits: {
			fileSize: 1000000, //1 mega by byte
		},
	}).single(fieldName);

	return (req, res, next) => {
		upload(req, res, (error) => {
			if (req.fileValidationError) {
				return res.status(400).send(req.fileValidationError);
			}
			if (!req.file && !error) {
				return res.status(400).send({
					message: 'upload file please',
				});
			}
			if (error) {
				if (error.code == 'LIMIT_FILE_SIZE') {
					return res.status(400).send({
						message: 'file must less than 1mb',
					});
				}
				return res.send(error);
			}
			return next();
		});
	};
};
