// src/components/CreateDemandaDialog.tsx

'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useCreateDemanda } from '@/hooks/useDemandaMutations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateDemandaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoDemanda?: string;
}

const TIPOS_PEDIDO = ['Sugestão', 'Reclamação', 'Solicitação', 'Elogio'];

const TIPOS_LOGRADOURO = [
  'Rua',
  'Avenida',
  'Travessa',
  'Alameda',
  'Via',
  'Rodovia',
];

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function CreateDemandaDialog({ open, onOpenChange, tipoDemanda = '' }: CreateDemandaDialogProps) {
  const createDemanda = useCreateDemanda();

  const [tipoPedido, setTipoPedido] = useState('');
  const [descricao, setDescricao] = useState('');
  const [bairro, setBairro] = useState('');
  const [tipoLogradouro, setTipoLogradouro] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cidade, setCidade] = useState('Vilhena');
  const [estado, setEstado] = useState('RO');
  const [cep, setCep] = useState('');
  const [imagens, setImagens] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setImagens(prev => [...prev, ...newFiles]);

      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index));

    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const logradouroCompleto = tipoLogradouro && logradouro
        ? `${tipoLogradouro} ${logradouro}`
        : logradouro;

      await createDemanda.mutateAsync({
        tipo: tipoDemanda,
        descricao,
        endereco: {
          logradouro: logradouroCompleto,
          cep,
          bairro,
          numero: Number(numero),
          complemento: complemento || undefined,
          cidade,
          estado,
        },
        imagem: imagens[0] || undefined,
      });

      setTipoPedido('');
      setDescricao('');
      setBairro('');
      setTipoLogradouro('');
      setLogradouro('');
      setNumero('');
      setComplemento('');
      setCidade('Vilhena');
      setEstado('RO');
      setCep('');

      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setImagens([]);
      setPreviewUrls([]);

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar demanda:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-white border-none"
        data-test="create-demanda-dialog"
      >
        <DialogHeader className="bg-[var(--global-accent)] py-4 px-6 rounded-t-lg">
          <DialogTitle
            className="text-2xl font-medium text-center text-white"
            data-test="create-demanda-title"
          >
            {tipoDemanda || 'Coleta'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulário para criação de nova demanda
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 max-h-[calc(90vh-80px)] overflow-y-auto" data-test="create-demanda-form">
          <div className="space-y-2">
            <Label className="text-gray-800 text-sm font-medium" data-test="tipo-pedido-label">
              * Tipo de pedido
            </Label>
            <div className="flex gap-4 flex-wrap" data-test="tipo-pedido-options">
              {TIPOS_PEDIDO.map((pedido) => (
                <label
                  key={pedido}
                  className="flex items-center gap-2 cursor-pointer"
                  data-test={`tipo-pedido-option-\${pedido.toLowerCase()}`}
                >
                  <input
                    type="radio"
                    name="tipoPedido"
                    value={pedido}
                    checked={tipoPedido === pedido}
                    onChange={(e) => setTipoPedido(e.target.value)}
                    className="w-4 h-4 accent-[var(--global-accent)]"
                    required
                    data-test={`tipo-pedido-radio-\${pedido.toLowerCase()}`}
                  />
                  <span className="text-sm text-gray-700">{pedido}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-gray-800 text-sm font-medium" data-test="endereco-label">
              * Endereço do ocorrido:
            </Label>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="bairro" className="text-gray-700 text-xs" data-test="bairro-label">
                  Bairro
                </Label>
                <Input
                  id="bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  required
                  className="bg-gray-100 text-gray-900 border-gray-300"
                  data-test="bairro-input"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="tipoLogradouro" className="text-gray-700 text-xs" data-test="tipo-logradouro-label">
                  Tipo de logadouro
                </Label>
                <Select value={tipoLogradouro} onValueChange={setTipoLogradouro}>
                  <SelectTrigger
                    className="bg-gray-100 text-gray-900 border-gray-300"
                    data-test="tipo-logradouro-select"
                  >
                    <SelectValue placeholder="Avenida" />
                  </SelectTrigger>
                  <SelectContent data-test="tipo-logradouro-options">
                    {TIPOS_LOGRADOURO.map((tipo) => (
                      <SelectItem
                        key={tipo}
                        value={tipo}
                        data-test={`tipo-logradouro-option-\${tipo.toLowerCase()}`}
                      >
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="logradouro" className="text-gray-700 text-xs" data-test="logradouro-label">
                  Logadouro
                </Label>
                <Input
                  id="logradouro"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  required
                  className="bg-gray-100 text-gray-900 border-gray-300"
                  data-test="logradouro-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="numero" className="text-gray-700 text-xs" data-test="numero-label">
                  Número
                </Label>
                <Input
                  id="numero"
                  type="number"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  required
                  className="bg-gray-100 text-gray-900 border-gray-300"
                  data-test="numero-input"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="complemento" className="text-gray-700 text-xs" data-test="complemento-label">
                  Complemento
                </Label>
                <Input
                  id="complemento"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Ao lado da praça"
                  className="bg-gray-100 text-gray-900 border-gray-300"
                  data-test="complemento-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cidade" className="text-gray-700 text-xs" data-test="cidade-label">
                  Cidade
                </Label>
                <Input
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  required
                  className="bg-gray-100 text-gray-900 border-gray-300"
                  data-test="cidade-input"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="estado" className="text-gray-700 text-xs" data-test="estado-label">
                  Estado
                </Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger
                    className="bg-gray-100 text-gray-900 border-gray-300"
                    data-test="estado-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent data-test="estado-options">
                    {ESTADOS_BRASIL.map((uf) => (
                      <SelectItem
                        key={uf}
                        value={uf}
                        data-test={`estado-option-\${uf.toLowerCase()}`}
                      >
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="cep" className="text-gray-700 text-xs" data-test="cep-label">
                  CEP
                </Label>
                <Input
                  id="cep"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  required
                  className="bg-gray-100 text-gray-900 border-gray-300"
                  data-test="cep-input"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-gray-800 text-sm font-medium" data-test="descricao-label">
              Descrição da demanda
            </Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Tem restos de construção em frente a minha casa, preciso que coletem pois está atrapalhando a passagem."
              required
              className="bg-gray-100 text-gray-900 border-gray-300 min-h-[100px]"
              data-test="descricao-textarea"
            />
          </div>

          <div className="space-y-2">
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3" data-test="images-preview-grid">
                {previewUrls.map((url, index) => (
                  <div key={url} className="relative w-full h-32" data-test={`image-preview-container-\${index}`}>
                    <img
                      src={url}
                      alt={`Preview \${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                      data-test={`image-preview-\${index}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                      data-test={`remove-image-button-\${index}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <label
                htmlFor="imagem"
                className="flex items-center gap-2 px-4 py-2 bg-[var(--global-accent)] hover:bg-[var(--global-accent-hover)] text-white rounded-md cursor-pointer transition-colors"
                data-test="image-upload-label"
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm font-medium">Adicionar imagem</span>
                <input
                  id="imagem"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  data-test="image-input"
                />
              </label>
              {previewUrls.length > 0 && (
                <span className="text-sm text-gray-600" data-test="images-count">
                  {previewUrls.length} imagem{previewUrls.length > 1 ? 'ns' : ''} selecionada{previewUrls.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={createDemanda.isPending}
              className="flex-1 bg-[var(--global-accent)] hover:bg-[var(--global-accent-hover)] text-white font-medium"
              data-test="submit-button"
            >
              {createDemanda.isPending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>

          {createDemanda.isError && (
            <p className="text-red-600 text-sm text-center" data-test="error-message">
              Erro ao criar demanda. Tente novamente.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
