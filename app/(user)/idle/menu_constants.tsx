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
        path: "/idle/dashboard",
        icon: <BsHouseDoor size={14} />,
      },
    ],
  },
  {
    title: "Management",
    menuList: [
      {
        title: "Idle",
        path: "/idle/orders",
        icon: <BsKanban size={14} />,
        submenu: true,
        subMenuItems: [{ title: "Report", path: "/idle/report" }],
      },
    ],
  },
  {
    title: "Data",
    menuList: [
      {
        title: "Data Table",
        path: "/idle/data",
        icon: <BsTable size={14} />,
        submenu: true,
        subMenuItems: [
          { title: "Man Hour", path: "/idle/table/man-hour" },
          { title: "Idle", path: "/idle/table/idle-data" },
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
