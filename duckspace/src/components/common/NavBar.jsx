import { NavLink } from "react-router-dom";

import homeGrayIcon from "../../assets/navbarIcon/home_gray.png";
import homeBlueIcon from "../../assets/navbarIcon/home_blue.png";

import searchGrayIcon from "../../assets/navbarIcon/search_gray.png";
import searchBlueIcon from "../../assets/navbarIcon/search_blue.png";

import ducktalkGrayIcon from "../../assets/navbarIcon/ducktalk_gray.png";
import ducktalkBlueIcon from "../../assets/navbarIcon/ducktalk_blue.png";

import duckGrayIcon from "../../assets/navbarIcon/duck_gray.png";
import duckBlueIcon from "../../assets/navbarIcon/duck_blue.png";

import chatGrayIcon from "../../assets/navbarIcon/chat_gray.png";
import chatBlueIcon from "../../assets/navbarIcon/chat_blue.png";

const navItems = [
  {
    label: "홈",
    path: "/",
    activeIcon: homeBlueIcon,
    inactiveIcon: homeGrayIcon,
  },
  {
    label: "검색",
    path: "/search",
    activeIcon: searchBlueIcon,
    inactiveIcon: searchGrayIcon,
  },
  {
    label: "덕톡 라운지",
    path: "/ducktalk",
    activeIcon: ducktalkBlueIcon,
    inactiveIcon: ducktalkGrayIcon,
  },
  {
    label: "채팅",
    path: "/chat",
    activeIcon: chatBlueIcon,
    inactiveIcon: chatGrayIcon,
  },
  {
    label: "장식장",
    path: "/display",
    activeIcon: duckBlueIcon,
    inactiveIcon: duckGrayIcon,
  },
];

function NavBar() {
  return (
    <nav className="fixed bottom-0 z-50 grid w-full grid-cols-5 items-center bg-white px-5 py-4">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          className="flex flex-col items-center gap-1 no-underline cursor-pointer"
        >
          {({ isActive }) => (
            <>
              <div className="flex h-6 w-6 items-center justify-center">
                <img
                  src={isActive ? item.activeIcon : item.inactiveIcon}
                  alt={`${item.label} 아이콘`}
                  className="h-full w-full object-contain"
                />
              </div>

              <span
                className={`whitespace-nowrap text-[12px] font-normal ${
                  isActive
                    ? "text-[#2F78FD]"
                    : "text-[#858485]"
                }`}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default NavBar;