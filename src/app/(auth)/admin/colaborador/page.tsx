"use client";

import { Pencil, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ColaboradorAdminPage() {

  return (
    <div className="min-h-screen bg-[var(--global-bg)]">
      <div className="px-6 sm:px-6 py-6 md:py-8">
        <div className="mx-auto space-y-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
            <div>
              <Button
                className="bg-[var(--global-text-primary)] hover:bg-[var(--global-text-secondary)] text-white"
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar colaborador
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portaria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível de acesso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nome</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Email</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">CPF</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Telefone</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Portaria</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Cargo</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nível de acesso</td>
                        <td>
                          <button
                            type="button"
                            className="p-1 hover:bg-gray-100 rounded"   
                          >
                            <Pencil className="h-4 w-4 text-[var(--global-text-primary)]" />
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Trash className="h-4 w-4 text-[var(--global-text-primary)]" />
                          </button>
                        </td>
                      </tr> 
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

