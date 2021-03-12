import React, {useEffect, useState} from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import Layout from '../components/Layout';
import axios from 'axios';
import * as settings from '../Settings';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
toast.configure();


function DataInterface(props) {
    // Determines page
    let active = window.location.search.slice(1);
    if (active.length === 0) {active = 'ad'};

    // States
    const [folders, setFolders] = useState([]);
    const [isLoading, setLoading] = useState(true);

    // Loads data
    useEffect(() => {
        axios.post(
            `${settings.API_SERVER}/api/getFolders/`,
            {
                group: props.groups,
                type: active,
            }, 
            {withCredentials: true}
        ).then(response => {
            setLoading(false);
            let data = response.data;
            if (typeof(data) !== String) {
                setFolders(data[active]);
            } else {
                toast.error(data, {
                    position: toast.POSITION.TOP_RIGHT,
                    hideProgressBar: true
                });
            }            
        })
    }, [])

    // UI elements
    const folderRows = () => {
        if (isLoading) {
            return(
                <div className='row my-8'>
                    <Spinner className='centered' variant='primary' animation='border'/>
                </div>
            )
        } else if (folders.length === 0) {
            if (active === 'ad') {
                return(
                    <div className='row my-8 ml-4'>
                        <p>
                            {'No Automated Diagnostics models created. Head over to '}
                            <a href='/models/?ad'>Diagnostics</a> 
                            {' to create a model instance.'}
                        </p>
                    </div>
                )
            } else if (active === 'pm') {
                return(
                    <div className='row my-8 ml-4'>
                        <p>
                            {'No Predictive Maintenance models created. Head over to '}
                            <a href='/models/?pm'>Predictive</a> 
                            {' to create a model instance.'}
                        </p>
                    </div>
                )
            }
        } else {
            const items = []
            folders.forEach((item, i) => {
                items.push(
                    <tr>
                        <td style={{width: '5%'}}>{i}</td>
                        <td>{item.title}</td>
                    </tr>
                )
            })
            return (
                <Table striped bordered hover>
                    <tbody>
                        {items}
                    </tbody>
                </Table>
            )
        }
    }

    return(
        <Layout {...props}>
            <Card>
                <Card.Header>
                    <Card.Title>Training Data Interface</Card.Title>
                    <Nav variant='tabs' defaultActiveKey={`/data-interface/?${active}`}>
                        <Nav.Item>
                            <Nav.Link href='/data-interface/?ad'>Automated Diagnostics</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href='/data-interface/?pm'>Predictive Maintenance</Nav.Link>
                        </Nav.Item>
                    </Nav>                    
                </Card.Header>
                <Card.Body>
                    {folderRows()}
                    <div className='col-xl-6 mt-5'>
                        <p>
                            {'To create additional models, go to '}
                            {/* <a href='/' */}
                        </p>
                    </div>
                </Card.Body>
            </Card>
        </Layout>
    )
}

export default DataInterface;