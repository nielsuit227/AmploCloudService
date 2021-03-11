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
import logo from '../files/28july-big.png';
import DjangoCSRFToken from 'django-react-csrftoken'
import axios from 'axios';
import * as settings from '../Settings';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
toast.configure();
// import { Card } from '@material-ui/core';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://amplo.ch">
        Amplo GmbH
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));


export default function SignUp(props) {
    const classes = useStyles();
    const [fname, setfName] = React.useState(null);
    const [lname, setlName] = React.useState(null);
    const [email, setEmail] = React.useState(null);
    const [phone, setPhone] = React.useState(null);
    const [pass, setPass] = React.useState(null);
    const handleForm = (e) => {
        switch (e.target.id) {
            case 'fname': setfName(e.target.value); break;
            case 'lname': setlName(e.target.value); break;
            case 'email': setEmail(e.target.value); break;
            case 'phone': setPhone(e.target.value); break;
            case 'pass': setPass(e.target.value); break;
            default: return null;
        }
    }
    const handleSubmit = (e) => {
        axios.post(
            `${settings.API_SERVER}/api/auth/create_user/`,
            {
                fname: fname,
                lname: lname,
                email: email,
                phone: phone,
                pass: pass
            },
            {withCredentials: true}
        ).then(response => {
            if (response.data === 'Success') {

            } else {
                toast.ERROR('Error. Please contact info@amplo.ch.', {
                    hideProgressBar: true,
                })
            }
        })
    }

  return (
    <Container component="main" maxWidth="xs"> 
        <Grid>
            <img src={logo} alt="..." width={'100%'}/>
        </Grid>        
        <Card>
            <Card.Body>
                <Typography component="h2" variant="h6">
                    Sign up for a free 6-month trail
                </Typography>
                <form className={classes.form}>
                    <DjangoCSRFToken/>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                autoFocus
                                id='fname'
                                label="First Name"
                                autoComplete="firstname"
                                variant="outlined"
                                onChange={handleForm}/>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                id="lname"
                                label="Last Name"
                                variant="outlined"
                                onChange={handleForm}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Business Email"
                                autoComplete="email"
                                variant="outlined"
                                onChange={handleForm}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="phone"
                                label="Phone Number"
                                autoComplete="phone"
                                variant="outlined"
                                onChange={handleForm}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="pass"
                                label="Password"
                                type="password"
                                autoComplete="current-password"
                                variant="outlined"
                                onChange={handleForm}/>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                block
                                variant="outline-primary"
                                color="primary"
                                onClick={handleSubmit}>
                                Get started
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid container justify="flex-end">
                        <Grid item>
                            <Link href="/login/" variant="body2">
                                Already have an account? Sign in
                            </Link>
                        </Grid>
                    </Grid>
                </form>
                <Box mt={5}>
                    <Copyright />
                </Box>
            </Card.Body>
        </Card>
    </Container>
  );
}