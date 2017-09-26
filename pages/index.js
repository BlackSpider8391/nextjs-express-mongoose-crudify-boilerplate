import fetch from 'isomorphic-unfetch'
import Head from 'next/head'

export default class IndexPage extends React.Component {

	static async getInitialProps ({req, res, query}) {
		try {
			const protocol = req.headers['x-forwarded-proto'] || 'http';
			const baseUrl = req ? `${protocol}://${req.headers.host}` : '';
			console.log('baseUrl', baseUrl);
			const url = `${baseUrl}/api/kittens`;
			const response = await fetch(url);
			const kittensJson = await response.json();
			return { apiUrl: url, kittens: kittensJson };
		}
		catch (err) {
			return { error: 'Could not load kittens' }
		}
	};

	constructor (props) {
		super(props)
		this.state = { name: '', kittens: props.kittens }
	}

	handleChange (event) {
		this.setState({ name: event.target.value });
	}

	handleAdd (event) {
		const newKitten = {
			name: this.state.name,
		};
		const updateLocalKittenState = function (results) {
			console.log('POST', results);
			this.setState({ name: '', kittens: this.state.kittens.concat(newKitten) });
		};
		// POST on API
		fetch(this.props.apiUrl, {
			method: 'POST',
			body: JSON.stringify(newKitten),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		})
		.then(updateLocalKittenState.bind(this))
		.catch(err => console.error('POST error', err));			
	}

	handleDelete (index, kittenId, event) {
		const updateLocalKittenState = function (results) {
			console.log('DELETE', results);
			this.setState({ kittens: this.state.kittens.filter(function (kitten) { return kitten._id !== kittenId }) });
		};
		// DELETE on API
		fetch(this.props.apiUrl + '/' + kittenId, {
			method: 'DELETE',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		})
		.then(updateLocalKittenState.bind(this))
		.catch(err => console.error('DELETE error', err));
	}

	render () {

		const kittenList = this.state.kittens ? this.state.kittens.map((kitten, index) =>
			<div key={index}>
				{kitten.name} 
				<a onClick={this.handleDelete.bind(this, index, kitten._id)}>x</a>
				<style jsx>{`
					a {
						color: tomato;
						margin-left: 0.5em;
						cursor: pointer;
					}
				`}</style>
			</div>
		) : [];

		return <div>
			<Head>
				<title>Next.js (React) + Express REST API + MongoDB + Mongoose-Crudify boilerplate</title>
				<meta name="description" content="Demo of nextjs-express-mongoose-crudify-boilerplate"/>
				<meta charset="utf-8"/>
				<meta name="viewport" content="initial-scale=1.0, width=device-width"/>
				<link rel="stylesheet" href="/static/app.css"/>
			</Head>
			<h1>Kittens</h1>
			{kittenList}
			<div>
				<input value={this.state.name} onChange={this.handleChange.bind(this)} placeholder='Enter a kitten name'/>
				<button onClick={this.handleAdd.bind(this)}>Add kitten</button>
				<style jsx>{`
					div {
						margin-top: 1em;
					}
				`}</style>
			</div>
		</div>
	};

}