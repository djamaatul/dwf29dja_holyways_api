const multer = require('multer');

exports.uploads = (to) => {
	const storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, 'assets');
		},
		filename: function (req, file, cb) {
			cb(null, Date.now() + '_' + file.originalname.replace(/\s/g, ''));
		},
	});
	return (upload = multer({
		storage,
	}).single(to));
};
