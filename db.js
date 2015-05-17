module.exports = {
	//'url' : 'mongodb://<dbuser>:<dbpassword>@novus.modulusmongo.net:27017/<dbName>'
	'url' : (process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost:27017' ) + '/infootball'
}