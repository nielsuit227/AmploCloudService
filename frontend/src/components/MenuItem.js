import { Link } from 'react-router-dom';


function MenuItem(title, link, active){
    if (active === title){
        return(
            <div className="col-auto">
                <h4>
                    {title}
                </h4>
            </div>
        )
    } else {
        return(
            <div className="col-auto">
                <Link className="h4 text-muted" to={link}>{title}</Link>
            </div>
        )
    }
}

export default MenuItem;