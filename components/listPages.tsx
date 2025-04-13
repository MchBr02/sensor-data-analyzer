// ./components/listPages.tsx

export const pages = [
    { path: "/", label: "Home" },
    { path: "/data/chart", label: "Live Sensor Charts" },
    { path: "/data", label: "Live Raw-Data" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/about", label: "About" },
    // { path: "/about", label: "About" },
    // { path: "/about", label: "About" },
  ];
  
  export default function ListPages() {
    return (
      <ul class="list-disc list-inside text-lg space-y-1 mb-4">
        {pages.map((page) => (
          <li key={page.path}>
            <a href={page.path} class="text-blue-800 underline hover:text-blue-600">
              {page.label}
            </a>
          </li>
        ))}
      </ul>
    );
  }
  