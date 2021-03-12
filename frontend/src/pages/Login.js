import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { connect } from 'react-redux';
import * as actions from '../store/authActions';
import { useHistory, useLocation } from 'react-router-dom';
import logo from '../files/28july-big.png';
import DjangoCSRFToken from 'django-react-csrftoken';


function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://amplo.ch/">
                Amplo GmbH
            </Link>{' '}
            {new Date().getFullYear()}
            .
        </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
    root: {
        background: '#2369eb',
        color: '#2369eb'
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

function Login(props) {
    const classes = useStyles();
    const [username, setuserName] = React.useState(null);
    const [password, setPassword] = React.useState(null);

    let history = useHistory();
    let location = useLocation();
    let { from } = location.state || { from: { pathname: "/dashboard/" } };
    React.useEffect(() => {
      	if (props.isAuthenticated) { history.replace(from)};
    });

    const handleFormFieldChange = (event) => {
		switch (event.target.id) {
			case 'username': setuserName(event.target.value); break;
			case 'password': setPassword(event.target.value); break;
			default: return null;
		}
    };
    const handleSubmit = (e) => {
		e.preventDefault();
		props.onAuth(username, password);
    }

    return (
		<Container component='main' maxWidth='xs'>
			<Grid>
				<img src={logo} alt='...' width={'100%'}/>
			</Grid>
			<Card>
				<Card.Body>
					<Typography component='h1' variant='h6'>Quality Management API Platform</Typography>
					<Link href="/signup/" variant="body2">
						Not registered yet? Sign up here
					</Link>
					<form className={classes.form + ' my-5'} noValidate onSubmit={handleSubmit}>
						<DjangoCSRFToken/>
						<Grid container spacing={1}>
							<Grid item xs={12}>
								<TextField
									autoFocus
									required
									fullWidth
									id="username"
									label="Email"
									name="username"
									autoComplete="username"
									variant="outlined"
									onChange={handleFormFieldChange}/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									variant="outlined"
									required
									fullWidth
									name="password"
									label="Password"
									type="password"
									id="password"
									autoComplete="current-password"
									onChange={handleFormFieldChange}/>
							</Grid>
							<Grid item xs={12}>
								<Button
									block
									variant="outline-primary"
									onClick={handleSubmit}>
									Sign In
								</Button>
							</Grid>
						</Grid>
					</form>
					<Box mt={8}>
						<Copyright />
					</Box>
				</Card.Body>
			</Card>			
	</Container>
    );
}
const mapDispatchToProps = dispatch => {
    return {
        onAuth: (username, password) => dispatch(actions.authLogin(username, password))
    }
}

export default connect(null, mapDispatchToProps)(Login);