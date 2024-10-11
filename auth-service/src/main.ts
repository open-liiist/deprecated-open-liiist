import express from 'express';

const app = express();
const port = process.env.AUTH_SERVICE_PORT || 4000;

app.use(express.json());

app.post('/login', (req, res) => {
	const { username, password } = req.body;

	if (username === 'admin' && password === 'admin') {
		res.status(200).json({ token: 'admin_token', message: 'Login successful' });
	} else {
		res.status(401).json({ message: 'Invalid credentials' });
	}
});

app.listen(port, () => {
	console.log(`Auth service running on port ${port}`);
});
