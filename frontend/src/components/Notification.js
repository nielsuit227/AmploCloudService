import React from 'react';
import Badge from 'react-bootstrap/Badge'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import getCookie from './getCookie';
import axios from 'axios';
import * as settings from '../Settings';
import { FaBell } from 'react-icons/fa';


class Notification extends React.Component{
    constructor(props){
        super(props);
        this.popover = this.popover.bind(this);
        this.markRead = this.markRead.bind(this);
        this.state = {
            notifications: [],
        }
    }
    componentDidMount() {
        axios.post(
            `${settings.API_SERVER}/api/getNotifications/`, 
            {}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        ).then(response => {
            let data = response.data;
            let count = 0;
            data.forEach((notification) => {
                if (notification.read === false) {
                    count += 1;
                };
            });
            this.setState({
                notifications: data,
                unread: count,
            });
        })
        .catch(err => {console.log(err)});
    }
    popover() {
        return(
            <Popover id="popover-basic">
                <Popover.Title as="h3">Notifications</Popover.Title>
                <Popover.Content>
                        {
                            this.state.notifications.map((not, idx) => {
                                return(
                                    <a href={"/ticket?"+not.ticket} key={idx}>
                                        <div className='col-auto my-1' key={idx + 'a'}>
                                            <h4>{not.notification}</h4>
                                            <div className='row my--2'>
                                                <strong className='mr-auto'>{not.creator__username}</strong>
                                                <small className='right'>{not.date}</small>
                                            </div>
                                            <hr key={idx + 'b'} className='my-2'></hr>
                                        </div>
                                    </a>
                                )
                            })
                        }
                </Popover.Content>
            </Popover>
        )
    }
    markRead(){
        this.setState({unread: 0})
        axios.post(
            `${settings.API_SERVER}/api/markRead/`, 
            {notifications: this.state.notifications.reduce((a, o) => (a.push(o.pk), a), [])}, 
            {headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'x-csrftoken': getCookie('csrftoken'),
            }} 
        ).then(res => {console.log(res)})
        .catch(err => {console.log(err)});
    }

    render() {
        return(
            <div className='mx-5 mt--3'>
                <OverlayTrigger trigger="click" placement="bottom" overlay={this.popover()} onEnter={this.markRead} rootClose>
                    <div className='row'>
                        <div className='col-auto mx-0 px-0'>
                            <FaBell size={40}/>
                        </div>
                        <div className='col-auto mt--3 mx-0 px-0'>
                            <Badge pill variant="danger">{this.state.unread}</Badge>
                        </div>
                    </div>
                </OverlayTrigger>
            </div>
        )
    }
}


export default Notification;