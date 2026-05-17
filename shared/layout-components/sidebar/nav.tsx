import React from "react";

const DashboardIcon = <i className="bx bx-home side-menu__icon"></i>

const ErrorIcon = <i className="bx bx-error side-menu__icon"></i>

const NestedmenuIcon = <i className="bx bx-layer side-menu__icon"></i>


const badge = <span className="badge !bg-warning/10 !text-warning !py-[0.25rem] !px-[0.45rem] !text-[0.75em] ms-2">12</span>
const badge1 = <span className="text-secondary text-[0.75em] rounded-sm !py-[0.25rem] !px-[0.45rem] badge !bg-secondary/10 ms-2">New</span>
const badge2=<span className="text-danger text-[0.75em] rounded-sm badge !py-[0.25rem] !px-[0.45rem] !bg-danger/10 ms-2">Hot</span>
const badge4 = <span className="text-success text-[0.75em] badge !py-[0.25rem] !px-[0.45rem] rounded-sm bg-success/10 ms-2">3</span>

export const MenuItems : any= [
    {
        menutitle: "MAIN",
},

            {icon: DashboardIcon, badgetxt: badge, title: 'Dashboards', type: "sub", active: false, children: [
                    {path: "/components/dashboards/crm", type: "link", active: false, selected: false, title: "CRM" },

                ]
            },
       
   
    {
        menutitle: "PAGES",
    },
            { icon: ErrorIcon, title: "Error", type: "sub", active: false, selected: false, children: [

                    {path: "/components/error/error-401", type: "link", active: false, selected: false, title: "401-Error" },
                ]
            },

    {
        menutitle: "Web app"
    },
            {
				icon: NestedmenuIcon, title: "Nested Menu", type: "sub", active: false, selected: false, children: [

					{ title: "Nested-1", path: "", type: "empty", active: false, selected: false },

					{
						title: "Nested-2", type: "sub", active: false, selected: false, children: [

							{ type: "empty", path: "", active: false, selected: false, title: "Nested-2-1" },
							{ type: "empty", path: "", active: false, selected: false, title: "Nested-2-2" },
							{ type: "empty", path: "", active: false, selected: false, title: "Nested-2-3" },
					
				]
			},
				]
			},
];
export default MenuItems
