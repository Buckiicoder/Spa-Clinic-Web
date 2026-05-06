import { useState } from "react";

interface Props {
  services: any[];
  value: number | null;
  onChange: (id: number | null) => void;
}

export default function ServiceCategorySelect({
  services,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  // ROOT
  const roots = services.filter((s) => !s.parent_id);

  // GROUP theo root
  const getChildren = (parentId: number) =>
    services.filter((s) => s.parent_id === parentId && !s.area);

  const selected = services.find((s) => s.id === value);

  return (
    <div className="relative">
      {/* SELECT BOX */}
      <div
        onClick={() => setOpen(!open)}
        className="w-full cursor-pointer rounded-xl border px-3 py-2 bg-white flex justify-between items-center"
      >
        <span className="text-sm">
          {selected ? selected.name : "Chọn phân loại"}
        </span>

        <span className="text-gray-400">▼</span>
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border bg-white shadow-lg max-h-60 overflow-auto">
          {/* ROOT */}
          {roots.map((root) => (
            <div key={root.id}>
              <div
                onClick={() => {
                  onChange(root.id);
                  setOpen(false);
                }}
                className="px-3 py-2 font-medium hover:bg-gray-100 cursor-pointer"
              >
                {root.name}
              </div>

              {/* GROUP */}
              {getChildren(root.id).map((child) => (
                <div
                  key={child.id}
                  onClick={() => {
                    onChange(child.id);
                    setOpen(false);
                  }}
                  className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  └ {child.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
