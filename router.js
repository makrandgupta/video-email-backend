module.exports = function(app) {
    app.use('/', require('./routes/index'));
    app.use('/api/video', require('./routes/api/video'));
    app.use('/api/email', require('./routes/api/email'));

    app.use('/auth/google', require('./routes/auth/google'));
    app.use('/auth/outlook', require('./routes/auth/outlook'));
};