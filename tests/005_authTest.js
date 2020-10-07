const chai = require('chai');
const chaiHttp = require('chai-http');

const {
	server,
	config,
	checkErrorResponse,
	ensureServerIsRunning } = require('./000_helpersTest');

chai.use(chaiHttp);
chai.should();

const apiPre = config.backend.apiPrefix;

before(done => {
	ensureServerIsRunning(server, done);
});

describe('Authentification Tests ', () => {
	let token = null;
	let generatedUserIds = [];
	let validCredentials = {
		username: 'newman-r@user.com',
		password: '1234',
	};

	it('AB_01 POST - Create new user - 201', done => {
		let user = {
			lastname: 'Newman',
			firstname: 'Randy',
			username: 'newman-r@user.com',
			password: '1234',
			state: 'active',
		};

		chai
			.request(server)
			.post(apiPre + '/users')
			.send(user)
			.end((err, res) => {
				res.should.have.status(201);
				res.body.should.be.a('object');
				res.body.should.not.have.property('password');
				generatedUserIds.push(res.body.id);

				done();
			});
	});

	it('AB_02 POST - Login user - 200', done => {
		chai
			.request(server)
			.post(apiPre + '/login')
			.send(validCredentials)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('token');
				token = res.body.token;
				done();
			});
	});

	it('AB_03 do an AUTHENTICATED GET Call - 200', done => {
		chai
			.request(server)
			.get(apiPre + '/secret')
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
	});

	it('AB_03a do an AUTHENTICATED GET Call and checks Who am I - 200', done => {
		chai
			.request(server)
			.get(apiPre + '/whoIAm')
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('loggedInAs').eql(validCredentials.username);
				done();
			});
	});

	it('AB_03b POST - Login user - Check Information Object - 200', done => {
		chai
			.request(server)
			.post(apiPre + '/login')
			.send(validCredentials)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('token');
				res.body.should.have.property('information');
				chai.expect(res.body.information.user.username).eql(validCredentials.username);
				token = res.body.token;
				done();
			});
	});

	it('AB_04 do a NON-AUTHENTICATED GET Call (no token) - 401', done => {
		chai
			.request(server)
			.get(apiPre + '/secret')
			.end((err, res) => {
				res.should.have.status(401);
				checkErrorResponse(res);
				done();
			});
	});

	it('AB_05 do a NON-AUTHENTICATED GET Call (wrong token) - 401', done => {
		chai
			.request(server)
			.get(apiPre + '/secret')
			.set('Authorization', 'Bearer xx' + token)
			.end((err, res) => {
				res.should.have.status(401);
				checkErrorResponse(res);
				done();
			});
	});

	it('AB_06 Logout current user - 200', done => {
		chai
			.request(server)
			.post(apiPre + '/logout')
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
	});

	it('AB_07 do a NON-AUTHENTICATED GET Call - user logged out before - 401', done => {
		// to simulate the logout, set the token to null
		token = null;
		chai
			.request(server)
			.get(apiPre + '/secret')
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(401);
				checkErrorResponse(res);
				done();
			});
	});

	it('AB_08 DELETE first user - 204', done => {
		chai
			.request(server)
			.delete(apiPre + '/users/' + generatedUserIds[0])
			.end((err, res) => {
				res.should.have.status(204);
				done();
			});
	});

	it('AB_09 Fail to Login - invalid credential object - 401', done => {
		let invalidCredentials = {
			usernameX: 'newman-r@user.com',
			passwordY: '1234',
		};

		chai.request(server)
			.post(apiPre + '/login')
			.send(invalidCredentials)
			.end((err, res) => {
				res.should.have.status(401);
				checkErrorResponse(res);
				done();
			});
	});

	it('AB_10 Fail to Login - no credential object - 401', (done) => {
		chai.request(server)
			.post(apiPre + '/login')
			.end((err, res) => {
				res.should.have.status(401);
				checkErrorResponse(res);
				done();
			});
	});

	it('AB_11 Fail to Login - credential object with too many properties - 401', (done) => {
		let invalidCredentials = {
			'username': 'newman-r@user.com',
			'password': '1234',
			'noneedprop': '1234'
		};

		chai.request(server)
			.post(apiPre + '/login')
			.send(invalidCredentials)
			.end((err, res) => {
				res.should.have.status(401);
				checkErrorResponse(res);
				done();
			});
	});

});
