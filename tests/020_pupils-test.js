const chai = require('chai');
const chaiHttp = require('chai-http');

const {
	server,
	config,
	checkErrorResponse,
	ensureServerIsRunning } = require('./000_helpersTest');

chai.use(chaiHttp);
chai.should();

const url = config.backend.apiPrefix + '/pupils';
const apiPre = config.backend.apiPrefix;


before(done => {
	ensureServerIsRunning(server, done);
});

describe('CRUD Entity /pupils ' + url, () => {
	let token = null;
	let generatedPupilIds = [];
	let singlePupilId = null;


	it('AE_01a GET all Pupils (without token) - 401', done => {
		chai
			.request(server)
			.get(url)
			.end((err, res) => {
				res.should.have.status(401);
				checkErrorResponse(res);
				done();
			});
	});

	it('AE_01b GET all Pupils (without wrong token) - 401', done => {
		chai
			.request(server)
			.get(url)
			.set('Authorization', 'Bearer nixgutestoken0')
			.end((err, res) => {
				res.should.have.status(401);
				checkErrorResponse(res);
				done();
			});
	});

	// create new test user and do the login
	it('AE_02a Create User "pupil1" - 201', done => {
		let user = {
			lastname: 'pupil1',
			firstname: 'pupil1',
			username: 'pupil1@htl-villach.at',
			password: '1234',
			state: 'active'
		};

		chai
			.request(server)
			.post(apiPre + '/users')
			.send(user)
			.end((err, res) => {
				res.should.have.status(201);
				done();
			});
	});

	it('AE_02b Login "pupil1" - 200', done => {
		let credentials = {
			username: 'pupil1@htl-villach.at',
			password: '1234',
		};

		chai
			.request(server)
			.post(apiPre + '/login')
			.send(credentials)
			.end((err, res) => {
				res.should.have.status(200);
				token = res.body.token;
				done();
			});
	});

	it('AE_03 GET all Pupils - 200 (empty array)', done => {
		chai
			.request(server)
			.get(url)
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body.length.should.be.eql(0);
				done();
			});
	});


	// start to create Pupils here 
	it('AE_04 Create Pupil - should fail, no auth. - 401', done => {
		let pupil = {
			account: 'KORNM',
			lastname: 'Korn',
			firstname: 'Max'
		};

		chai
			.request(server)
			.post(url)
			.set('Authorization', 'Bearer nogoodtokenhere')
			.send(pupil)
			.end((err, res) => {
				res.should.have.status(401);
				checkErrorResponse(res);
				done();
			});
	});

	it('AE_05 Create Pupil - should fail, too less props - 400', done => {
		let pupil = {};

		chai
			.request(server)
			.post(url)
			.set('Authorization', 'Bearer ' + token)
			.send(pupil)
			.end((err, res) => {
				res.should.have.status(400);
				checkErrorResponse(res);
				done();
			});
	});

	it('AE_06 Create Pupil - should fail, too much props - 400', done => {
		let pupil = {
			account: 'KORNM',
			lastname: 'Korn',
			firstname: 'Max',
			label: 'SYP',
			wrong: 'prop'
		};

		chai
			.request(server)
			.post(url)
			.set('Authorization', 'Bearer ' + token)
			.send(pupil)
			.end((err, res) => {
				res.should.have.status(400);
				checkErrorResponse(res);
				done();
			});
	});

	it('AE_07 Create first Pupil - 201', done => {
		let pupil = {
			account: 'KORNM',
			lastname: 'Korn',
			firstname: 'Max'
		};

		chai
			.request(server)
			.post(url)
			.set('Authorization', 'Bearer ' + token)
			.send(pupil)
			.end((err, res) => {
				res.should.have.status(201);
				res.body.should.be.a('object');
				Object.keys(res.body).length.should.eql(4);

				res.body.should.have.property('id').not.to.be.null;
				res.body.should.have.property('account').eql(pupil.account);
				res.body.should.have.property('lastname').eql(pupil.lastname);
				res.body.should.have.property('firstname').eql(pupil.firstname);

				generatedPupilIds.push(res.body.id);
				done();
			});
	});

	it('AE_08 Create Pupil - should fail, account not unique - 400', done => {
		let pupil = {
			account: 'KORNM',
			lastname: 'Korn1',
			firstname: 'Max1'
		};
		chai
			.request(server)
			.post(url)
			.set('Authorization', 'Bearer ' + token)
			.send(pupil)
			.end((err, res) => {
				res.should.have.status(400);
				checkErrorResponse(res);
				done();
			});
	});

	it('AE_09 Create second Pupil - 201', done => {
		let pupil = {
			account: 'WEIZENS',
			lastname: 'Weizen',
			firstname: 'Susi'
		};

		chai
			.request(server)
			.post(url)
			.set('Authorization', 'Bearer ' + token)
			.send(pupil)
			.end((err, res) => {
				res.should.have.status(201);
				generatedPupilIds.push(res.body.id);
				done();
			});
	});

	it('AE_10 Create third Pupil - 201', done => {
		let pupil = {
			account: 'REISF',
			lastname: 'Reis',
			firstname: 'Franz'
		};

		chai
			.request(server)
			.post(url)
			.set('Authorization', 'Bearer ' + token)
			.send(pupil)
			.end((err, res) => {
				res.should.have.status(201);
				generatedPupilIds.push(res.body.id);
				done();
			});
	});

	it('AE_11 GET all Pupils (expect 3) - 200', done => {
		chai
			.request(server)
			.get(url)
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body.length.should.be.eql(3);
				done();
			});
	});


	// change the user, create two new ous in a new period and check the result 
	// of two ous in the end
	// create new test user and do the login
	it('AE_12 Create User "pupil2" - 201', done => {
		let user = {
			lastname: 'pupil2',
			firstname: 'pupil2',
			username: 'pupil2@htl-villach.at',
			password: '1234',
			state: 'active'
		};

		chai
			.request(server)
			.post(apiPre + '/users')
			.send(user)
			.end((err, res) => {
				res.should.have.status(201);
				done();
			});
	});

	it('AC_13 Login user "pupil2" - 200', done => {
		let credentials = {
			username: 'pupil2@htl-villach.at',
			password: '1234',
		};

		chai
			.request(server)
			.post(apiPre + '/login')
			.send(credentials)
			.end((err, res) => {
				res.should.have.status(200);
				token = res.body.token;
				done();
			});
	});

	it('AE_14 Create Pupil for other User - 201', done => {
		let pupil = {
			account: 'COFFEEJ',
			lastname: 'Coffee',
			firstname: 'John'
		};

		chai
			.request(server)
			.post(url)
			.set('Authorization', 'Bearer ' + token)
			.send(pupil)
			.end((err, res) => {
				res.should.have.status(201);
				generatedPupilIds.push(res.body.id);
				done();
			});
	});

	it('AE_15 Create Pupil for other User - 201', done => {
		let pupil = {
			account: 'KREIDEW',
			lastname: 'Kreide',
			firstname: 'Wolf'
		};

		chai
			.request(server)
			.post(url)
			.set('Authorization', 'Bearer ' + token)
			.send(pupil)
			.end((err, res) => {
				res.should.have.status(201);
				generatedPupilIds.push(res.body.id);
				done();
			});
	});

	it('AE_16 GET all Pupils of the other user (expect 2) - 200', done => {
		chai
			.request(server)
			.get(url)
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body.length.should.be.eql(2);

				let currentPupil = res.body[0];
				Object.keys(currentPupil).length.should.eql(4);

				currentPupil.should.have.property('id').not.to.be.null;
				currentPupil.should.have.property('account');
				currentPupil.should.have.property('lastname');
				currentPupil.should.have.property('firstname');
				done();
			});
	});


	it('AE_17 GET Pupil by id - 200', done => {
		singlePupilId = generatedPupilIds[generatedPupilIds.length - 1];
		chai
			.request(server)
			.get(url + '/' + singlePupilId)
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.not.have.property('length');

				Object.keys(res.body).length.should.eql(4);

				res.body.should.have.property('id').eql(singlePupilId);
				res.body.should.have.property('account');
				res.body.should.have.property('lastname');
				res.body.should.have.property('firstname');

				done();
			});
	});

	// testing the single GET with other user > Login pupil1
	it('AE_18 Login user "pupil1" - 200', done => {
		let credentials = {
			username: 'pupil1@htl-villach.at',
			password: '1234',
		};

		chai
			.request(server)
			.post(apiPre + '/login')
			.send(credentials)
			.end((err, res) => {
				res.should.have.status(200);
				token = res.body.token;
				done();
			});
	});


	it('AE_19 GET Pupil by id - with id from other user - 404', done => {
		chai
			.request(server)
			.get(url + '/' + singlePupilId)
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(404);
				checkErrorResponse(res);
				done();
			});
	});

	it('AE_20 GET Pupil by id - with wrong id - 404', done => {
		chai
			.request(server)
			.get(url + '/' + 12345)
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(404);
				checkErrorResponse(res);
				done();
			});
	});


	// DELETE first pupil of user 1   
	it('AE_21 DELETE first Pupil from user1 - 204', done => {
		chai
			.request(server)
			.delete(url + '/' + generatedPupilIds[0])
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(204);
				done();
			});
	});

	it('AE_21 DELETE second Pupil from user1 - 204', done => {
		chai
			.request(server)
			.delete(url + '/' + generatedPupilIds[1])
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(204);
				done();
			});
	});

	it('AE_21 DELETE third Pupil from user1 - 204', done => {
		chai
			.request(server)
			.delete(url + '/' + generatedPupilIds[2])
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(204);
				done();
			});
	});

	it('AE_22 GET all Pupils of the user1 (expect 0) - 200', done => {
		chai
			.request(server)
			.get(url)
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body.length.should.be.eql(0);
				done();
			});
	});

	it('AE_22 Login user "pupil2" - 200', done => {
		let credentials = {
			username: 'pupil2@htl-villach.at',
			password: '1234',
		};

		chai
			.request(server)
			.post(apiPre + '/login')
			.send(credentials)
			.end((err, res) => {
				res.should.have.status(200);
				token = res.body.token;
				done();
			});
	});

	it('AE_23 DELETE first Pupil from user1 - 204', done => {
		chai
			.request(server)
			.delete(url + '/' + generatedPupilIds[3])
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(204);
				done();
			});
	});

	it('AE_24 DELETE non existing Pupil - 404', done => {
		chai
			.request(server)
			.delete(url + '/' + 12345)
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(404);
				checkErrorResponse(res);
				done();
			});
	});

	it('AE_25 GET all Pupils of the user2 (expect 1) - 200', done => {
		chai
			.request(server)
			.get(url)
			.set('Authorization', 'Bearer ' + token)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body.length.should.be.eql(1);
				done();
			});
	});

});
