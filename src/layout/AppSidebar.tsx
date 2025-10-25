import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

// Assume these icons are imported from an icon library
import clsx from 'clsx';
import { useSidebar } from '../context/SidebarContext';
import {
  BoxCubeIcon,
  ChevronDownIcon,
  FileIcon,
  GroupIcon,
  HorizontaLDots,
  LockIcon,
  PieChartIcon,
  PlugInIcon,
  UserIcon,
} from '../icons';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const getNavItems = (t: (key: string) => string): NavItem[] => [
  // {
  //   icon: <GridIcon />,
  //   name: t('dashboard'),
  //   subItems: [{ name: 'Ecommerce', path: '/', pro: false }],
  // },
  {
    icon: <GroupIcon />,
    name: t('companies'),
    path: '/companies',
  },
  {
    icon: <UserIcon />,
    name: t('customers'),
    path: '/customers',
    subItems: [
      { name: t('customers'), path: '/customers' },
      { name: t('customerGroups'), path: '/customer-groups' },
    ],
  },
  {
    icon: <UserIcon />,
    name: t('vendors'),
    path: '/vendors',
    subItems: [
      { name: t('vendors'), path: '/vendors' },
      { name: t('vendorGroups'), path: '/vendor-groups' },
    ],
  },
  {
    icon: <FileIcon />,
    name: t('plans'),
    path: '/plans',
  },
  {
    icon: <LockIcon />,
    name: t('roles'),
    path: '/roles',
  },
  {
    icon: <GroupIcon />,
    name: t('users'),
    path: '/users',
  },
  // {
  //   icon: <CalenderIcon />,
  //   name: 'Calendar',
  //   path: '/calendar',
  // },
  // {
  //   icon: <UserCircleIcon />,
  //   name: 'User Profile',
  //   path: '/profile',
  // },
  // {
  //   name: 'Forms',
  //   icon: <ListIcon />,
  //   subItems: [{ name: 'Form Elements', path: '/form-elements', pro: false }],
  // },
  // {
  //   name: 'Tables',
  //   icon: <TableIcon />,
  //   subItems: [{ name: 'Basic Tables', path: '/basic-tables', pro: false }],
  // },
  // {
  //   name: 'Pages',
  //   icon: <PageIcon />,
  //   subItems: [
  //     { name: 'Blank Page', path: '/blank', pro: false },
  //     { name: '404 Error', path: '/error-404', pro: false },
  //   ],
  // },
];

const getOthersItems = (t: (key: string) => string): NavItem[] => [
  {
    icon: <PieChartIcon />,
    name: t('charts'),
    subItems: [
      { name: t('lineChart'), path: '/line-chart', pro: false },
      { name: t('barChart'), path: '/bar-chart', pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: t('uiElements'),
    subItems: [
      { name: t('alerts'), path: '/alerts', pro: false },
      { name: t('avatars'), path: '/avatars', pro: false },
      { name: t('badges'), path: '/badge', pro: false },
      { name: t('buttons'), path: '/buttons', pro: false },
      { name: t('images'), path: '/images', pro: false },
      { name: t('videos'), path: '/videos', pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: 'Authentication',
    subItems: [
      { name: 'Sign In', path: '/signin', pro: false },
      { name: 'Sign Up', path: '/signup', pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { t, i18n } = useTranslation('navigation');
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: 'main' | 'others';
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  const navItems = getNavItems(t);
  const othersItems = getOthersItems(t);

  useEffect(() => {
    let submenuMatched = false;
    ['main', 'others'].forEach((menuType) => {
      const items = menuType === 'main' ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as 'main' | 'others',
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: 'main' | 'others') => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: 'main' | 'others') => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? 'menu-item-active'
                  : 'menu-item-inactive'
              } cursor-pointer ${!isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'}`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive'
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ms-auto h-5 w-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index ? 'text-brand-500 rotate-180' : ''
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'}`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : '0px',
              }}
            >
              <ul className="mt-2 ml-9 space-y-1">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path) ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'
                      }`}
                    >
                      {subItem.name}
                      <span className="ms-auto flex items-center gap-1">
                        {subItem.new && (
                          <span
                            className={`ms-auto ${
                              isActive(subItem.path) ? 'menu-dropdown-badge-active' : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ms-auto ${
                              isActive(subItem.path) ? 'menu-dropdown-badge-active' : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed start-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen ? 'w-[290px]' : isHovered ? 'w-[290px]' : 'w-[90px]'
      } ${isMobileOpen ? 'translate-x-0' : i18n.language === 'en' ? '-translate-x-full' : 'translate-x-full'} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex py-2 ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}>
        <Link to="/" className="w-full py-3">
          <>
            {!isExpanded || isHovered || isMobileOpen ? (
              <img className="min:h-20 mx-auto w-20" src="  /images/logo/icon color cyan.png" alt="Logo" />
            ) : (
              <img
                className={clsx('min:h-20 mx-auto', isExpanded || isHovered || isMobileOpen ? 'w-full' : 'w-16')}
                src="/images/logo/logo.png"
                alt="Logo"
              />
            )}
          </>
        </Link>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs leading-[20px] text-gray-400 uppercase ${
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? t('menu') : <HorizontaLDots className="size-6" />}
              </h2>
              {renderMenuItems(navItems, 'main')}
            </div>
            {/* <div className="">
              <h2
                className={`mb-4 flex text-xs leading-[20px] text-gray-400 uppercase ${
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? 'Others' : <HorizontaLDots />}
              </h2>
              {renderMenuItems(othersItems, 'others')}
            </div> */}
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
