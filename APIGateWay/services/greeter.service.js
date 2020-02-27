
var PROTO_PATH = __dirname + '/../../protos/helloworld.proto';
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
	PROTO_PATH,
	{
		keepCase: true,
		longs: String,
		enums: String,
		defaults: true,
		oneofs: true
	});
var hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;


module.exports = {
	name: "greeter",

	/**
	 * Service settings
	 */
	settings: {

	},

	/**
	 * Service metadata
	 */
	metadata: {

	},

	/**
	 * Service dependencies
	 */
	//dependencies: [],	

	/**
	 * Actions
	 */
	actions: {

		/**
		 * Say a 'Hello'
		 *
		 * @returns
		 */
		hello() {
			return "Hello Moleculer";
		},

		/**
		 * Welcome a username
		 *
		 * @param {String} name - User name
		 */
		welcome: {
			params: {
				name: "string"
			},
			async handler(ctx) {
				const { params } = ctx;
				var client = new hello_proto.Greeter('localhost:50051', grpc.credentials.createInsecure());

				let result = await new Promise(resolve => {
					client.sayHello({
						name: params.name,
						midname: 'pham',
						address: {
							ward: '1',
							city: 'hcm'
						}
					}, function (err, response) {
						resolve({ err, response })
					})
				})

				return result;
			}
		}
	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
		console.log('created')
	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {
		console.log('started')

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {
		console.log('stopped')

	}
};