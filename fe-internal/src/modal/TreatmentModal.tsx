import { useMemo, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAppSelector } from "../app/hook";
import {
  saveTreatmentPlan,
  selectCurrentPlan,
} from "../features/treatment/treatmentSlice";
import { useAppDispatch } from "../app/hook";
import {
  searchStepsAPI,
  searchSessionsAPI,
} from "../features/treatment/treatmentAPI";
import {
  fetchProducts,
  selectProducts,
} from "../features/product/productSlice";


export default function TreatmentModal({ open, onClose, onSubmit }: any) {
  type Product = {
    product_id?: number;
    name: string;
    quantity: number;
  };

  type Step = {
    name: string;
    duration: number;
    products: Product[];
  };

  type Phase = {
    name: string;
    from_session: number;
    to_session: number;
    steps_template: Step[];
  };

  const dispatch = useAppDispatch();
const products = useAppSelector(selectProducts);
  const [showStepDropdown, setShowStepDropdown] = useState<number | null>(null);
  const [showSessionDropdown, setShowSessionDropdown] = useState<number | null>(
    null,
  );

  const currentPlan = useAppSelector(selectCurrentPlan);

  const [phases, setPhases] = useState<Phase[]>([]);
  const [localStepTemplates, setLocalStepTemplates] = useState<any[]>([]);
  const [localSessionTemplates, setLocalSessionTemplates] = useState<any[]>([]);
  const [productKeyword, setProductKeyword] = useState("");
const [showProductDropdown, setShowProductDropdown] = useState<{
  pIndex: number;
  stIndex: number;
} | null>(null);

  const filteredProducts = useMemo(() => {
  const keyword = productKeyword.toLowerCase();

  return products.filter((p: any) =>
    p.name.toLowerCase().includes(keyword)
  );
}, [products, productKeyword]);

  useEffect(() => {
  dispatch(fetchProducts());
}, [dispatch]);

useEffect(() => {
  const handleClick = (e: any) => {
    if (!e.target.closest(".dropdown-wrapper")) {
      setShowStepDropdown(null);
      setShowSessionDropdown(null);
      setShowProductDropdown(null); // ✅ thêm
    }
  };

  window.addEventListener("click", handleClick);
  return () => window.removeEventListener("click", handleClick);
}, []);

  useEffect(() => {
    if (!currentPlan?.phases) {
      setPhases([]);
      return;
    }

    const mapped = currentPlan.phases.map((p: any) => {
      const steps =
        p.sessions?.[0]?.steps?.map((st: any) => ({
          name: st.name,
          duration: st.duration,
          products: st.products || [],
        })) || [];

      return {
        name: p.name,
        from_session: p.from_session,
        to_session: p.to_session,
        steps_template: steps,
      };
    });

    setPhases(mapped);
  }, [currentPlan]);

  if (!open) return null;

  const searchSteps = async (keyword: string) => {
    try {
      const res = await searchStepsAPI(keyword);

      setLocalStepTemplates(
        res.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          duration: item.duration_minutes,
          products: item.products || [],
        })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const searchSessions = async (keyword: string) => {
    try {
      const res = await searchSessionsAPI(keyword);

      setLocalSessionTemplates(
        res.data.map((item: any) => ({
          id: item.id,
          name: item.title,
          steps: item.steps || [],
        })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ================= UPDATE =================
  const update = (fn: any) => {
    setPhases((prev) => {
      const clone = structuredClone(prev);
      fn(clone);
      return clone;
    });
  };

  // ================= ADD =================
  const addPhase = () =>
    setPhases([
      ...phases,
      {
        name: "",
        from_session: 1,
        to_session: 1,
        steps_template: [],
      },
    ]);

  const moveStep = (pIndex: number, from: number, to: number) => {
    update((c: any) => {
      const arr = c[pIndex].steps_template;
      if (to < 0 || to >= arr.length) return;

      const item = arr.splice(from, 1)[0];
      arr.splice(to, 0, item);
    });
  };

  const removePhase = (p: number) =>
    setPhases(phases.filter((_, i) => i !== p));

  const buildPayload = () => {
  return {
    phases: phases.map((p) => ({
      name: p.name,
      from_session: Number(p.from_session),
      to_session: Number(p.to_session),
      steps_template: (p.steps_template || []).map((s: any) => ({
        name: s.name,
        duration: Number(s.duration || 0),
        products: (s.products || []).map((prod: any) => ({
          product_id: Number(prod.product_id), // 🔥 FIX CỨNG
          quantity: Number(prod.quantity || 1),
        })),
      })),
    })),
  };
};

  const handleSave = async () => {
    const total = currentPlan?.total_sessions || 0;

    const covered: number[] = [];

    phases.forEach((p) => {
      for (let i = p.from_session; i <= p.to_session; i++) {
        covered.push(i);
      }
    });

    const unique = new Set(covered);

    if (unique.size !== total) {
      alert("Thiếu hoặc trùng số buổi trong giai đoạn");
      return;
    }

    if (Math.max(...covered) > total) {
      alert("Vượt quá số buổi của gói");
      return;
    }

    await dispatch(
      saveTreatmentPlan({
        packageId: currentPlan.id,
        data: buildPayload(),
      }),
    );

    onClose();
  };

  // ================= UI =================
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[1200px] rounded-3xl p-6 max-h-[90vh] overflow-auto shadow-lg">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Quy trình liệu trình</h2>

          <button
            onClick={addPhase}
            className="flex items-center gap-2 bg-amber-700 text-white px-4 py-2 rounded-xl"
          >
            <Plus size={16} /> Thêm giai đoạn
          </button>
        </div>

        {/* PACKAGE INFO */}
        <div className="mb-4 p-4 rounded-xl bg-gray-50 border">
          <div className="font-semibold text-lg">{currentPlan?.name}</div>
          <div className="text-sm text-gray-500">
            Tổng số buổi: {currentPlan?.total_sessions}
          </div>
        </div>

        {/* PHASES */}
        {phases.map((phase, pIndex) => (
          <div key={pIndex} className="border rounded-2xl p-4 mb-4 bg-amber-50">
            {/* HEADER PHASE */}
            <div className="flex flex-wrap gap-2 items-center mb-3">
              <input
                value={phase.name}
                placeholder="Tên giai đoạn"
                onChange={(e) =>
                  update((c: any) => {
                    c[pIndex].name = e.target.value;
                  })
                }
                className="border rounded-xl px-3 py-2 w-48"
              />

              <input
                type="number"
                value={phase.from_session}
                onChange={(e) =>
                  update((c: any) => {
                    c[pIndex].from_session = +e.target.value;
                  })
                }
                className="border px-2 py-2 w-20 rounded-xl"
              />

              <span>-</span>

              <input
                type="number"
                value={phase.to_session}
                onChange={(e) =>
                  update((c: any) => {
                    c[pIndex].to_session = +e.target.value;
                  })
                }
                className="border px-2 py-2 w-20 rounded-xl"
              />

              <div className="flex gap-2">
                {/* SESSION TEMPLATE */}
                <div className="relative dropdown-wrapper">
                  <input
                    placeholder="Tìm buổi"
                    className="border px-3 py-2 rounded-xl w-56"
                    onFocus={() => {
                      setShowSessionDropdown(pIndex);
                      searchSessions("");
                    }}
                    onChange={(e) => {
                      searchSessions(e.target.value);
                    }}
                  />

                  {showSessionDropdown === pIndex && (
                    <div className="absolute z-20 bg-white border rounded-xl shadow w-full mt-1 max-h-60 overflow-auto">
                      {localSessionTemplates.map((tpl) => (
                        <div
                          key={tpl.id}
                          className="px-3 py-2 hover:bg-amber-50 cursor-pointer text-sm"
                          onClick={() => {
                            update((c: any) => {
                              c[pIndex].steps_template = (tpl.steps || []).map(
                                (s: any) => ({
                                  name: s.name,
                                  duration:
                                    s.duration || s.duration_minutes || 0,
                                  products: s.products || [],
                                }),
                              );
                            });

                            setShowSessionDropdown(null);
                          }}
                        >
                          {tpl.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* STEP TEMPLATE */}
                <div className="relative dropdown-wrapper">
                  <input
                    placeholder="Tìm bước"
                    className="border px-3 py-2 rounded-xl w-56"
                    onFocus={() => {
                      setShowStepDropdown(pIndex);
                      searchSteps("");
                    }}
                    onChange={(e) => {
                      searchSteps(e.target.value);
                    }}
                  />

                  {showStepDropdown === pIndex && (
                    <div className="absolute z-20 bg-white border rounded-xl shadow w-full mt-1 max-h-60 overflow-auto">
                      {localStepTemplates.map((tpl) => (
                        <div
                          key={tpl.id}
                          className="px-3 py-2 hover:bg-amber-50 cursor-pointer text-sm"
                          onClick={() => {
                            update((c: any) => {
                              if (!c[pIndex].steps_template) {
                                c[pIndex].steps_template = [];
                              }

                              c[pIndex].steps_template.push({
                                name: tpl.name,
                                duration:
                                  tpl.duration || tpl.duration_minutes || 0,
                                products: tpl.products || [],
                              });
                            });

                            setShowStepDropdown(null);
                          }}
                        >
                          {tpl.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => removePhase(pIndex)}
                className="text-red-500 ml-auto"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* RANGE */}
            <div className="text-sm text-gray-500 mb-3">
              Các bước quy trình áp dụng cho các buổi {phase.from_session} →{" "}
              {phase.to_session}
            </div>

            {/* STEP LIST */}
            <div className="bg-white rounded-2xl border divide-y">
              {phase.steps_template?.map((step: any, stIndex: number) => (
                <div
                  key={stIndex}
                  className="p-3 flex items-center gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      value={step.name}
                      placeholder="Tên bước"
                      onChange={(e) =>
                        update((c: any) => {
                          c[pIndex].steps_template[stIndex].name =
                            e.target.value;
                        })
                      }
                      className="border px-3 py-2 rounded-xl w-56"
                    />

                    <input
                      type="number"
                      value={step.duration}
                      placeholder="phút"
                      onChange={(e) =>
                        update((c: any) => {
                          c[pIndex].steps_template[stIndex].duration =
                            +e.target.value;
                        })
                      }
                      className="border px-3 py-2 w-16 rounded-xl"
                    />

                    <div className="flex flex-row border rounded-lg overflow-hidden">
                      <button
                        onClick={() => moveStep(pIndex, stIndex, stIndex - 1)}
                        className="px-2 py-1 hover:bg-gray-100 border-b"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveStep(pIndex, stIndex, stIndex + 1)}
                        className="px-2 py-1 hover:bg-gray-100"
                      >
                        ↓
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        update((c: any) => {
                          c[pIndex].steps_template.splice(stIndex, 1);
                        })
                      }
                      className="text-red-500"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* PRODUCT SELECT */}
{/* PRODUCT SELECT */}
<div className="relative dropdown-wrapper mt-2">
  <input
    placeholder="Tìm sản phẩm..."
    className="border px-2 py-1 rounded-lg w-48 text-sm"
    onFocus={() =>
      setShowProductDropdown({ pIndex, stIndex })
    }
    onChange={(e) => {
      setProductKeyword(e.target.value);
    }}
  />

  {showProductDropdown &&
    showProductDropdown.pIndex === pIndex &&
    showProductDropdown.stIndex === stIndex && (
      <div className="absolute z-20 bg-white border rounded-xl shadow w-64 mt-1 max-h-60 overflow-auto">
        {filteredProducts.slice(0,20).map((prod: any) => (
          <div
            key={prod.id}
            className="px-3 py-2 hover:bg-amber-50 cursor-pointer text-sm"
            onClick={() => {
              update((c: any) => {
                if (!c[pIndex].steps_template[stIndex].products) {
                  c[pIndex].steps_template[stIndex].products = [];
                }

                c[pIndex].steps_template[stIndex].products.push({
                  product_id: Number(prod.id),
                  name: prod.name,
                  quantity: 1,
                });
              });

              setShowProductDropdown(null);
              setProductKeyword("");
            }}
          >
            {prod.name}
          </div>
        ))}
      </div>
    )}
</div>


                  {/* PRODUCT LIST */}
                  <div className="flex flex-wrap items-center gap-2">
                    {step.products?.map((prod: any, prIndex: number) => (
                      <div
                        key={prIndex}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{prod.name}</span>

                        {/* chỉ hiện khi có sản phẩm */}
                        <input
                          type="number"
                          value={prod.quantity}
                          onChange={(e) =>
                            update((c: any) => {
                              c[pIndex].steps_template[stIndex].products[
                                prIndex
                              ].quantity = +e.target.value;
                            })
                          }
                          className="w-10 text-center border rounded-md text-xs"
                        />

                        <button
                          onClick={() =>
                            update((c: any) => {
                              c[pIndex].steps_template[stIndex].products.splice(
                                prIndex,
                                1,
                              );
                            })
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ADD STEP */}
            <button
              onClick={() =>
                update((c: any) => {
                  c[pIndex].steps_template.push({
                    name: "",
                    duration: 0,
                    products: [],
                  });
                })
              }
              className="text-sm text-amber-700 mt-2"
            >
              + thêm bước
            </button>
          </div>
        ))}

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2">
            Hủy
          </button>

          <button
            onClick={handleSave}
            className="bg-black text-white px-5 py-2 rounded-xl"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
