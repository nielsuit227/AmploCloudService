import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';


function Footer() {
    return (
            <Typography className="my-3" variant="body2" color="textSecondary" align="center">
                {'Copyright © '}
                <Link color="inherit" href="https://amplo.ch/">
                Amplo GmbH
                </Link>{' '}
                {new Date().getFullYear()}
                {'.'}
        </Typography>
    );
  }
export default Footer