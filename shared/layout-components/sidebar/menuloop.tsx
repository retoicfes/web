import store from "@/shared/redux/store";
import Link from "next/link";
import { Fragment} from "react";

function Menuloop({ MenuItems, toggleSidemenu, level,HoverToggleInnerMenuFn }: any) {
  
  const theme = store.getState();

  return (
    <Fragment>
      <Link href="#!" className={`side-menu__item ${MenuItems?.selected ? "active" : ""}`}
        onClick={(event) => { event.preventDefault(); toggleSidemenu(event, MenuItems, undefined, true); }} onMouseEnter={(event) => HoverToggleInnerMenuFn(event, MenuItems)}>{MenuItems.icon}<span className={`${level == 1 ? "side-menu__label" : ""}`}> {MenuItems.title} {MenuItems.badgetxt ? (<span className={MenuItems.class}> {MenuItems.badgetxt} </span>
        ) : (
          ""
        )}
        </span>
        <i className="fe fe-chevron-right side-menu__angle"></i>
      </Link>
      <ul className={`slide-menu child${level}  
      ${MenuItems?.active && level == 1 && theme.dataVerticalStyle === "doublemenu" ? 'double-menu-active' : ''} 
      ${MenuItems?.dirchange ? "force-left" : ""} `} style={MenuItems.active ? { display: "block" } : { display: "none" }}
      >
        {level <= 1 ? <li className="slide side-menu__label1">
          <Link href="#!">{MenuItems.title}</Link>
        </li> : ""}
        {MenuItems.children.map((firstlevel: any) =>
          <li className={`${firstlevel.menutitle ? 'slide__category' : ''} ${firstlevel?.type == 'empty' ? 'slide' : ''} ${firstlevel?.type == 'link' ? 'slide' : ''} ${firstlevel?.type == 'sub' ? 'slide has-sub' : ''} ${firstlevel?.active ? 'open' : ''} ${firstlevel?.selected ? 'active' : ''}`} key={Math.random()}>
            {firstlevel.type === "link" ?
              <Link href={firstlevel.path + "/"} className={`side-menu__item ${firstlevel.selected ? 'active' : ''}`}>{firstlevel.icon}
                <span className=""> {firstlevel.title} {firstlevel.badgetxt ? (<span className={firstlevel.class}> {firstlevel.badgetxt}</span>
                ) : (
                  ""
                )}
                </span>
              </Link>
              : ""}
            {firstlevel.type === "empty" ?
              <Link href="#" className='side-menu__item'> {firstlevel.icon}<span className=""> {firstlevel.title} {firstlevel.badgetxt ? (<span className={firstlevel.class}> {firstlevel.badgetxt} </span>
              ) : (
                ""
              )}
              </span>
              </Link>
              : ""}
            {firstlevel.type === "sub" ?
              <Menuloop MenuItems={firstlevel} toggleSidemenu={toggleSidemenu} HoverToggleInnerMenuFn={HoverToggleInnerMenuFn} level={level + 1} />
              : ''}

          </li>
        )}

      </ul>
    </Fragment>
  );
}
export default Menuloop;
