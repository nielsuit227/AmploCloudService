import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import logo from '../files/28july-big.png';
import axios from 'axios';
import * as settings from '../Settings';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
toast.configure();


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

export default function UserVerification() {

    const [verified, setVerified] = useState(false);
    useEffect(() => {
        let search = window.location.search;
        if (search.includes('email') && search.includes('key')) {
            axios.post(
                `${settings.API_SERVER}/api/auth/verify/`,
                {
                    email: search.substring(7, search.indexOf('&')),
                    key: search.substring(search.indexOf('&') + 5)
                }
            ).then(response => {
                if (response.data === 'Success') {
                    setVerified(true);
                } else {
                    console.log(response.data)
                }
            })
        }
    }, [])
    const result = () => {
        if (verified) {
            return(
                <p>
                    {'Successfully verified! You can now '} 
                    <a href='/login/'>log in</a>
                </p>
            )
        } else {
            return(
                <p>
                    {'Verification failed. Please contact '}
                    <a href='mailto:info@amplo.ch'>info@amplo.ch</a>.
                </p>
            )
        }
    }

    return (
        <Container component="main" maxWidth="xs"> 
            <Grid>
                <img src={logo} alt="..." width={'100%'}/>
            </Grid>        
            <Card>
                <Card.Body>
                    {result()}
                    <Copyright/>
                </Card.Body>
            </Card>
        </Container>
    );
}
  