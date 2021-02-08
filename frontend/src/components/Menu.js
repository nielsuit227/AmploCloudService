import MenuItem from './MenuItem';


function Menu(menuList, menuLinks, active) {
    return(
        <div className="card-header bg-transparent">
            <div className="row my--2">
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