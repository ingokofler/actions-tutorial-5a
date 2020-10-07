const AppError = require('./error-model');

module.exports.handleError = (err, req, res, next) => {
    if (err instanceof AppError) {
        let responseObj = {
            'code': err.code,
            'message': err.message
        };

        switch (err.code.toString()) {
            case '400':
                res.status(400).send(responseObj);
                break;
            case '401':
                res.status(401).send(responseObj);
                break;
            case '404':
                res.status(404).send(responseObj);
                break;
            default:
                res.status(500).send(responseObj);
        }
    } else {
        let responseObj = {
            'code': 500,
            'message': 'Internal Server Error - Unexcepted'
        };

        console.error(`critical error (non AppError) Message: ${err.message}`);
        console.error(`Stack: ${err.stack}`);
        // just to avoid the eslint-warning
        next;
        res.status(500).send(responseObj);
    }
};

module.exports.handleAsyncError = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => next(err));
    };
};

module.exports.criticalErrorAnswer = (req, res) => {
    res.status(500).send('system currently not available ...');
};

