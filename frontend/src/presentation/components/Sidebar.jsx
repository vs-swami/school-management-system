import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, FileText, X, DollarSign, School, Bus, Wallet, CreditCard, Receipt } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Enrollments', href: '/enrollments', icon: BookOpen },
  { name: 'Classes', href: '/classes', icon: School },
  { name: 'Transport', href: '/transport', icon: Bus },
  { name: 'Fee Management', href: '/fees', icon: DollarSign },
  {
    name: 'Finance',
    href: '/finance',
    icon: CreditCard,
    submenu: [
      { name: 'Dashboard', href: '/finance', icon: Receipt },
      { name: 'Fee Collection', href: '/finance/fee-collection', icon: DollarSign },
      { name: 'Pending Payments', href: '/finance/pending-payments', icon: DollarSign },
      { name: 'Wallets', href: '/finance/wallets', icon: Wallet },
    ]
  },
  { name: 'Reports', href: '/reports', icon: FileText },
];

export const Sidebar = ({ toggleSidebar }) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = React.useState(null);

  React.useEffect(() => {
    // Auto-expand menu if current path matches submenu
    navigation.forEach(item => {
      if (item.submenu) {
        const isInSubmenu = item.submenu.some(sub => location.pathname.startsWith(sub.href));
        if (isInSubmenu) {
          setExpandedMenu(item.name);
        }
      }
    });
  }, [location.pathname]);

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-4 flex justify-between items-center md:hidden">
        <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
          aria-label="Close sidebar"
          onClick={toggleSidebar}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href ||
                           (item.submenu && location.pathname.startsWith(item.href));
            const isExpanded = expandedMenu === item.name;

            return (
              <li key={item.name}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => setExpandedMenu(isExpanded ? null : item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                      <svg
                        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {isExpanded && (
                      <ul className="ml-8 mt-2 space-y-1">
                        {item.submenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = location.pathname === subItem.href;
                          return (
                            <li key={subItem.name}>
                              <Link
                                to={subItem.href}
                                className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                                  isSubActive
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <SubIcon className="mr-2 h-4 w-4" />
                                {subItem.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};