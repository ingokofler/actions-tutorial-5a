const chai = require('chai');
const chaiHttp = require('chai-http');
const pupils2A = require('./data/Pupils2A.json');
const allPupils = require('./data/allPupils.json');

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


	it('ZZ_05 Create Pupils and collect OU to Pupil Assignments per Id - 201', done => {
		let relevantPupils = allPupils.Sheet0;
		let classSelection = ["2AHIF", "3AHIF"];
		let classOUMap = {
			"2AHIF": "POS 2A",
			"3AHIF": "POS Web 3A"
		}
		relevantPupils = relevantPupils.filter(p => classSelection.includes(p["klasse.name"]));

		relevantPupils.forEach(p => {
			let pupil = {
				account: p.name,
				lastname: p.longName,
				firstname: p.foreName
			};

			chai
				.request(server)
				.post(`${backendUrl}/pupils`)
				.send(pupil)
				.set('Authorization', 'Bearer ' + token)
				.end((err, res) => {
					res.should.have.status(201);
					generatedPupilsAndOURelation.push(
						{
							pupilid: res.body.id,
							ouid: generatedOUIdsAndLabels[classOUMap[p["klasse.name"]]]
						});

					if (generatedPupilsAndOURelation.length == relevantPupils.length) {
						console.log(`${relevantPupils.length} pupils created`);
						done();
					}
				});
		});
	});
});
