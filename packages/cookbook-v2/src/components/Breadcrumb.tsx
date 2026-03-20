import { Link, useNavigate } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { examples } from "../examples";

const categories = [...new Set(examples.map((e) => e.category))];
const grouped = categories.map((cat) => ({
  label: cat,
  items: examples.filter((e) => e.category === cat),
}));

export function Breadcrumb({ exampleId }: { exampleId?: string }) {
  const navigate = useNavigate();
  const current = exampleId
    ? examples.find((e) => e.id === exampleId)
    : undefined;

  return (
    <nav className="flex items-center text-sm gap-1">
      <Link
        to="/examples"
        className="text-gray-500 hover:text-gray-900 font-medium"
      >
        Examples
      </Link>
      {current && (
        <>
          <ChevronRightIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <select
            value={current.id}
            onChange={(e) => navigate(`/examples/${e.target.value}`)}
            className="bg-transparent text-gray-900 font-medium border-none outline-none cursor-pointer hover:text-primary-600 pr-5 -mr-2"
          >
            {grouped.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </>
      )}
    </nav>
  );
}
