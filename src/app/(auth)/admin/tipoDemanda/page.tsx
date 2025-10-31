"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTipoDemandaModal } from "@/components/createTipoDemandaModal";

export default function TipoDemandaAdminPage() {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--global-bg)]">
            
            <div>
              <Button
                className="bg-[var(--global-text-primary)] hover:bg-[var(--global-text-secondary)] text-white"
                onClick={() => setOpenCreate(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar tipo de demanda
              </Button>
            </div>

        {openCreate && (
            <CreateTipoDemandaModal
                open={openCreate}
                onOpenChange={(open) => {
                    setOpenCreate(open);
                    if (!open) {
                        setOpenCreate(false);
                    }
                }}
            />
        )}            
    </div>

    
  );
}


