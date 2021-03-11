import React, {useEffect, useState} from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Layout from '../components/Layout';


function DataInterface(props) {
    // Determines page
    let active = window.location.search;
    if (active.length === 0) {active = '?ad'};

    // States
    const [folders, setFolders] = useState();

    // Loads data
    useEffect(() => {
        console.log('Executed!')
    })

    return(
        <Layout {...props}>
            <Card>
                <Card.Header>
                    <Nav variant='tabs' defaultActiveKey={`/data-interface/${active}`}>
                        <Nav.Item>
                            <Nav.Link href='/data-interface/?ad'>Automated Diagnostics</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href='/data-interface/?pm'>Predictive Maintenance</Nav.Link>
                        </Nav.Item>
                    </Nav>                    
                </Card.Header>
            </Card>
        </Layout>
    )
}

export default DataInterface;