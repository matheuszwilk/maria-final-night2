import { SideNavItemGroup } from "@/types/type";
import {
  BsBoxArrowLeft,
  BsGear,
  BsHouseDoor,
  BsKanban,
  BsTable,
} from "react-icons/bs";

export const SIDENAV_ITEMS: SideNavItemGroup[] = [
  {
    title: "",
    menuList: [
      {
        title: "Dashboard",
        path: "/andon/dashboard",
        icon: <BsHouseDoor size={14} />,
      },
    ],
  },
  {
    title: "Management",
    menuList: [
      {
        title: "Andon",
        path: "/andon/orders",
        icon: <BsKanban size={14} />,
        submenu: true,
        subMenuItems: [{ title: "Report", path: "/andon/report" }],
      },
    ],
  },
  {
    title: "Data",
    menuList: [
      {
        title: "Data Table",
        path: "/andon/data",
        icon: <BsTable size={14} />,
        submenu: true,
        subMenuItems: [
          { title: "Man Hour", path: "/andon/table/man-hour" },
          { title: "Andon", path: "/andon/table/andon" },
        ],
      },
    ],
  },
  {
    title: "Others",
    menuList: [
      {
        title: "Configuration",
        path: "/config",
        icon: <BsGear size={14} />,
      },
      {
        title: "Back To Projects",
        path: "/projects",
        icon: <BsBoxArrowLeft size={14} />,
      },
    ],
  },
];
