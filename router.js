module.exports = function(app) {
    app.use('/', require('./routes/public'));
    app.use('/view', require('./routes/public/view'));

    app.use('/api/email', require('./routes/api/email'));

    app.use('/auth/google', require('./routes/auth/google'));
    app.use('/auth/outlook', require('./routes/auth/outlook'));
};