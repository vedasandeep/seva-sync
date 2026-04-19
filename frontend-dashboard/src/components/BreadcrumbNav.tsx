import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function BreadcrumbNav() {
  const location = useLocation();
  
  // Parse location path into breadcrumbs
  const pathSegments = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: '/' + arr.slice(0, index + 1).join('/'),
    }));

  if (pathSegments.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 px-4 sm:px-6 py-3 text-sm text-slate-600 bg-white border-b border-slate-200">
      <Link to="/" className="text-blue-600 hover:text-blue-700 transition-colors">
        Home
      </Link>
      {pathSegments.map((segment, index) => (
        <div key={segment.path} className="flex items-center gap-2">
          <ChevronRight size={16} className="text-slate-400" />
          {index === pathSegments.length - 1 ? (
            <span className="text-slate-900 font-medium">{segment.label}</span>
          ) : (
            <Link to={segment.path} className="text-blue-600 hover:text-blue-700 transition-colors">
              {segment.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
