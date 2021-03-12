import React, {useEffect, useState} from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Layout from '../components/Layout';


function Settings(props) {
    let active = winsow.location.search;
    if (active.length === 0) {active='?groups'}

    // States

    // APIs
    useEffect(() => {

    });

    // Return
    return(
        <Layout {...props}>
            <Card>
                <Card.Header>
                    <Nav variant='tabs' defaultActiveKey={`/settings/${active}`}>
                        <Nav.Item>
                            <Nav.Link href='/settings/?groups'>Groups</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href='/settings/?users'>Users</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
            </Card>
        </Layout>
    )
}