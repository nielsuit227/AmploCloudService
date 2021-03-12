import React, {useEffect, useState} from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Nav from 'react-bootstrap/Nav';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import Layout from '../components/Layout';
import axios from 'axios';
import * as settings from '../Settings';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ownDateFormat } from '../components/Functions';
toast.configure();


function Models(props) {
    // Determines page
    let active = window.location.search.slice(1);
    if (active.length === 0) {active = 'ad'};

    // States
    const [models, setModels] = useState([]);
    const addModel = (newModel) => setModels(models => [...models, newModel]);
    const [isLoading, setLoading] = useState(true);
    const [userInput, setInput] = useState('');

    // Loads data
    useEffect(() => {
        axios.post(
            `${settings.API_SERVER}/api/getModels/`,
            {group: props.groups}, 
            {withCredentials: true}
        ).then(response => {
            setLoading(false);
            let data = response.data;
            if (typeof(data) !== 'string') {
                setModels(data[active]);
            } else {
                toast.error(data, {
                    position: toast.POSITION.TOP_RIGHT,
                    hideProgressBar: true
                });
            }            
        })
    }, [])
    // Handlers
    const handleInput = (e) => {
        if (e.code === 'Enter') {
            let data = {
                group: props.groups,
                folder: userInput.toLowerCase().replace(' ', '_'),
                type: active,
                title: userInput,
                version: 'v0.0.1',
                deployed: false,
            };
            axios.post(
                `${settings.API_SERVER}/api/changeModel/`,
                data,
                {withCredentials: true}
            ).then(response => {
                if (response.data === 'Success!') {
                    addModel(data);
                    document.body.click();
                } else {
                    toast.error(response.data, {
                        position: toast.POSITION.TOP_RIGHT,
                        hideProgressBar: true,
                    });
                }
            })
        }
    }

    // UI elements
    const modelRows = () => {
        console.log(models)
        if (isLoading) {
            return(
                <div className='row my-8'>
                    <Spinner className='centered' variant='primary' animation='border'/>
                </div>
            )
        } else if (models.length === 0) {
            if (active === 'ad') {
                return(
                    <div className='row my-8 ml-4'>
                        <p>
                            No Automated Diagnostics models created.
                        </p>
                    </div>
                )
            } else if (active === 'pm') {
                return(
                    <div className='row my-8 ml-4'>
                        <p>
                            No Predictive Maintenance models created.
                        </p>
                    </div>
                )
            }
        } else {
            const items = []
            models.forEach((item, i) => {
                items.push(
                    <tr>
                        <td style={{width: '5%'}}>{i}</td>
                        <td>{item.title}</td>
                        <td>{item.version}</td>
                        <td>{item.deployed ? 'deployed' : 'development'}</td>
                        <td>{ownDateFormat(item.last_edit)}</td>
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
    const addModelPop = (props) => {
        return(
            <Popover id='popover' {...props}>
                <Popover.Content>
                    <div className='col-xl-auto'>
                        <input 
                            className='myinput'
                            placeholder='Model Name'
                            onKeyDown={(e)=>handleInput(e)}
                            onChange={(e)=>setInput(e.target.value)}/>
                    </div>
                </Popover.Content>
            </Popover>
        );
    }

    return(
        <Layout {...props}>
            <Card>
                <Card.Header>
                    <Card.Title>Model Interface</Card.Title>
                    <Nav variant='tabs' defaultActiveKey={`/models/?${active}`}>
                        <Nav.Item>
                            <Nav.Link href='/models/?ad'>Automated Diagnostics</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href='/models/?pm'>Predictive Maintenance</Nav.Link>
                        </Nav.Item>
                    </Nav>                    
                </Card.Header>
                <Card.Body>
                    {modelRows()}
                    <div className='col-xl-6 mt-5'>
                        <OverlayTrigger
                            trigger='click'
                            rootClose={true}
                            placement='top'
                            overlay={(p)=>addModelPop(p)}>
                            <Button 
                                variant='outline-primary'
                                onClick={()=>setInput('')}>
                                Add Model
                            </Button>
                        </OverlayTrigger>
                    </div>
                </Card.Body>
            </Card>
        </Layout>
    )
}

export default Models;