const chai = require('chai');
const chaiHttp = require('chai-http');

const {
	server,
	config,
	checkErrorResponse,
	ensureServerIsRunning } = require('./000_helpersTest');

chai.use(chaiHttp);
chai.should();

const url = config.backend.apiPrefix + '/memberships';
const backendUrl = config.backend.apiPrefix;


before(done => {
	ensureServerIsRunning(server, done);
});

describe('GENERATE TEST DATA' + url, () => {
	let token = null;
	let generatedUserIds = [];
	let generatedPeriodIds = [];
	let generatedOUIdsAndLabels = {};
	let generatedPupilsAndOURelation = [];
	let generatedMembershipIds = [];

	it('ZZ_01 POST Create user - 201', done => {
		let user = {
			lastname: 'Karasek',
			firstname: 'achim',
			username: 'achim@htl-villach.at',
			password: '1234',
			state: 'active',
		};

		chai
			.request(server)
			.post(`${backendUrl}/users`)
			.send(user)
			.end((err, res) => {
				res.should.have.status(201);
				generatedUserIds.push(res.body.id);
				done();
			});
	});

	it('ZZ_02 Login user - 200', done => {
		let credentials = {
			username: 'achim@htl-villach.at',
			password: '1234',
		};

		chai
			.request(server)
			.post(`${backendUrl}/login`)
			.send(credentials)
			.end((err, res) => {
				res.should.have.status(200);
				token = res.body.token;
				done();
			});
	});
});
