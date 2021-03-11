import { Link } from 'react-router-dom';


function MenuItem(title, link, active){
    if (active === title){
        return(
            <div className="col-auto">
                <h5 className='text-blue'><u>{title}</u></h5>
            </div>
        )
    } else {
        return(
            <div className="col-auto">
                <Link className="h5" to={link}>{title}</Link>
            </div>
        )
    }
}

function Menu(menuList, menuLinks, active) {
    return(
        <div className="card-header">
            <div className="row mt-1">
                {
                    menuList.map((item, idx) => {
                        return(MenuItem(item, menuLinks[idx], active));
                    })
                }
            </div>
        </div>
    )    
}


export default Menu;