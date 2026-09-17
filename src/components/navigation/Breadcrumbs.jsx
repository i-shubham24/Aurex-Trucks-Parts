import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs({ customItems = [] }) {
  const location = useLocation();
  
  const generateBreadcrumbs = () => {
    if (customItems.length > 0) return customItems;
    
    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbs = [
      { label: "Home", path: "/", icon: Home }
    ];

    let accumulatedPath = "";
    pathnames.forEach((name, index) => {
      accumulatedPath += `/${name}`;
      const isLast = index === pathnames.length - 1;
      
      breadcrumbs.push({
        label: name.charAt(0).toUpperCase() + name.slice(1),
        path: accumulatedPath,
        active: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center gap-2 text-[12px] text-[#9CA3AF] font-semibold" aria-label="Breadcrumb">
      {breadcrumbs.map((item, index) => (
        <div key={item.path} className="flex items-center gap-2">
          {index > 0 && <ChevronRight size={12} />}
          {item.active ? (
            <span className="text-[#1A1A2E]">{item.label}</span>
          ) : (
            <Link 
              to={item.path} 
              className="hover:text-[#0B2F5C] transition flex items-center gap-1.5"
            >
              {item.icon && <item.icon size={12} />}
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}