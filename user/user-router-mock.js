const express = require('express');
// created with:
// https://www.mockapi.io/projects/5e3e8b2564c3f60014550b8e 

const router = express.Router();
let users = [

];

router.getUsers = () => users;

router.get('/', function (req, res) {
	let numberOfQueryKeys = Object.keys(req.query).length;
	let selectedUsers = null;
	let queryStringCorrect = false;
	let singleRecordExpected = false;


	switch (numberOfQueryKeys) {
		case 0:
			// default get '/'
			selectedUsers = users.map(x => x);
			queryStringCorrect = true;
			break;
		case 1:
			// GET /users?state=active
			if (req.query.state !== undefined) {
				selectedUsers = users.filter(u => u.state == req.query.state);
				queryStringCorrect = true;
			}

			// GET /users?username=kaa@htl-villach.at
			if (req.query.username !== undefined) {
				selectedUsers = users.filter(u => u.username == req.query.username);
				queryStringCorrect = true;
				singleRecordExpected = true;
			}
			break;
	}

	if (!queryStringCorrect) {
		res.status(400).send('query not correct');
	}
	else {
		selectedUsers.forEach(u => delete u.password);

		if (singleRecordExpected) {
			if (selectedUsers.length != 1) {
				res.status(404).send('not found');
			} else {
				res.json(selectedUsers[0]);
			}
		} else {
			res.json(selectedUsers);
		}
	}
});

router.get('/:id', selectById, (req, res) => {
	res.json(req.selectedUser);
});

router.post('/', (req, res) => {
	let lastId;
	let user = req.body;
	let requiredProperties = ['lastname', 'firstname', 'username', 'password', 'state'];

	if (requiredProperties.length != Object.keys(user).length)
		return res.status(400).send('number of properties not correct');

	if (!requiredProperties.every(k => Object.keys(user).includes(k) && user[k]))
		return res.status(400).send('required property is missing');

	if ((user['state'] != 'active') && (user['state'] != 'inactive'))
		//throw new AppError(400, `state value  with value "${user["state"]}" not allowed `);
		return res.status(400).send('state value not allowed');

	if (users.some(u => u.username == user.username))
		return res.status(400).send('username already exists');

	if (users.length == 0) {
		lastId = 0;
	} else {
		lastId = users[users.length - 1].id;
	}

	user.id = Number(lastId) + 1;
	users.push(user);

	let newUser = Object.assign({}, user);
	delete newUser.password;
	res.status(201).json(newUser);
});

router.patch('/:id', selectById, (req, res) => {
	let user = req.body;
	let allowedProperties = ['id', 'lastname', 'firstname', 'password', 'state'];

	if (Object.keys(user).length < 1 || Object.keys(user).length > 4)
		return res.status(400).send('number of properties not correct');

	if (!Object.keys(user).every(k => allowedProperties.includes(k) && user[k]))
		return res.status(400).send('unkown property sent');

	Object.keys(user).forEach(k => users[Number(req.params.id) - 1][k] = user[k]);

	let userToReturn = users.filter(u => u.id == Number(req.params.id))[0];
	delete userToReturn.password;
	res.status(200).json(userToReturn);
});

router.delete('/:id', selectById, (req, res) => {
	users = users.filter(u => u.id != req.selectedUser.id);
	res.status(204).send();
});

router.put('*', (req, res) => res.status(405).send());

function selectById(req, res, next) {
	let selectedUsers = users.filter(u => u.id == req.params.id);
	if (selectedUsers.length == 1) {
		delete selectedUsers.password;
		req.selectedUser = selectedUsers[0];
		next();
	} else {
		res.status(404).send();
	}
}

module.exports = router;
