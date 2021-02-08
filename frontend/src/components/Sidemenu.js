
import React from 'react';
import '../css/argon-dashboard.css';
import { FaTv, FaChartBar, FaChartLine, FaCogs, FaRunning, FaClipboardList } from 'react-icons/fa';
import logo from '../files/28july-big.png';
import { Divider } from '@material-ui/core';

class Sidemenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: '',
            titles: ['Dashboard', 'Monitor', 'Asset Data'],
            links: ['/dashboard/', '/monitor/', '/data/'],
            icons: [
                <FaTv className='mx-4'/>,
                <FaChartBar className="mx-4"/>,
                <FaChartLine className="mx-4"/>,
                <FaClipboardList className="mx-4" />,
                <FaCogs className="mx-4"/>,
            ],
        }
    }
    componentDidMount() {
        let url = window.location.pathname;
        let active = this.state.links.findIndex((item) => item === url);
        this.setState({
            active: active
        });
    }
    activeItem(title, icon, link, idx) {
        return(
            <li className="nav-item" key={idx + 'a'}>
                <a className="nav-link active" key={idx + 'b'} href={link}>
                    {icon} {title}
                </a>
            </li>
        )
    }
    deActiveItem(title, icon, link, idx) {
        return(
            <li className="nav-item" key={idx + '1'}>
                <a className="nav-link" href={link} key={idx + '2'}>
                    {icon} {title}
                </a>
            </li>
        )
    }

    render() {
        return(
            <nav className="navbar navbar-vertical fixed-left navbar-expand-md navbar-light bg-white" id="sidenav-main">
                <div className="container-fluid">
                    <div className="navbar-brand pt-5">
                        <img src={logo} alt="..."></img>
                        <ul className="navbar-nav pt-7">
                            {
                                this.state.titles.map((title, idx) => {
                                    if (idx === this.state.active) {
                                        return(
                                            this.activeItem(
                                                title, 
                                                this.state.icons[idx], 
                                                this.state.links[idx], 
                                                idx));
                                    } else {
                                        return(
                                            this.deActiveItem(title, this.state.icons[idx], this.state.links[idx], idx));
                                    }
                                })
                            }
                            <hr className="my-9"/>
                            <Divider/>
                            <hr className='my-2'/>
                            <li className='nav-item'>
                                <a className='nav-link' href='/settings/assets/'>
                                    <FaCogs className='mx-4'/> Settings
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className='nav-link' href="/" onClick={() => this.props.logout()}>
                                    <FaRunning className="mx-4"/> Logout
                                </a>
                            </li>
                        </ul>    
                    </div>
                </div>
            </nav>
        )
    }
}

export default Sidemenu