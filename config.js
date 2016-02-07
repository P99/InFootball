module.exports = {
    'host': process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
    'port': process.env.OPENSHIFT_NODEJS_PORT || 8080,
    'mongodb': (
        process.env.OPENSHIFT_MONGODB_DB_URL || process.env.LOCAL_MONGODB_DB_URL // 'mongodb://localhost:27017/'
        || 'mongodb://ca693a8ccfa2cd3464d532afdfab31c5:bf7863d7a446ecb58603a177c5eeed3b@ds055792.mongolab.com:55792/'
    ) + 'infootball',
    'secret': 'c27002abbec4e54d7c33b9740675a069',

}
