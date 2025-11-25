"use client";

import { useState } from "react";
import UploadComponent from "./components/upload";
import QcList from "./components/qcList";

const menuItems = [{ label: "诊疗记录", components: QcList }];

const Doctor = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);

  const ActiveComponent = menuItems[activeMenuIndex]?.components || QcList;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#1d1d1f] flex">
      <aside className="w-72 bg-white flex flex-col p-6 shadow-[4px_0_25px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 pb-6 border-b border-[#f0f0f0]">
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#52c8a2] to-[#2d8864]" />
          <div>
            <div className="text-lg font-semibold">李 华</div>
            <div className="text-sm text-[#848484]">呼吸科 主任医师</div>
          </div>
        </div>

        <div className="pt-6 space-y-6 flex-1">
          <div>
            <div className="text-xs text-[#b7b7b7] tracking-[0.3em] mb-3">
              主菜单
            </div>
            <nav className="space-y-2">
              {menuItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => setActiveMenuIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm ${
                    activeMenuIndex === index
                      ? "bg-[#f0f8f4] text-[#3aa982]"
                      : "text-[#7a7a7a] hover:bg-[#f7f7f7]"
                  }`}
                >
                  <span className="flex-1">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 w-full overflow-hidden">
        <ActiveComponent />
      </main>
      <UploadComponent
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
};

export default Doctor;
