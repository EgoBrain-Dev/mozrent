import { useState, FormEvent } from "react";
import { X, Plus, Upload, ShieldCheck, HelpCircle, Home, Car, Wrench } from "lucide-react";
import { Listing, CategoryType, ProvinceType } from "../types";
import { MOZAMBIQUE_PROVINCES } from "../data";

interface AddListingModalProps {
  onClose: () => void;
  onAddListing: (newListing: Omit<Listing, "id" | "views" | "rating" | "verified" | "featured">) => void;
}

export default function AddListingModal({ onClose, onAddListing }: AddListingModalProps) {
  const [category, setCategory] = useState<CategoryType>("imovel");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState(""); // like Vivenda, Apartamento, Trator, Hilux
  const [price, setPrice] = useState<number>(10000);
  const [period, setPeriod] = useState<'mês' | 'dia' | 'evento'>("mês");
  const [location, setLocation] = useState(""); // Ex: Av. da OUA, Maputo
  const [province, setProvince] = useState(MOZAMBIQUE_PROVINCES[0]);
  const [rooms, setRooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [spaceArea, setSpaceArea] = useState(""); // size Ex: 120 m²
  const [image, setImage] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>(["Água e EDM Credelec func."]);
  const [landlordName, setLandlordName] = useState("");
  const [landlordPhone, setLandlordPhone] = useState("");
  const [allowCredelecRefund, setAllowCredelecRefund] = useState(true);

  // Suggested placeholders for images based on category
  const suggestedImages = {
    imovel: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=85",
    veiculo: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=85",
    equipamento: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=85"
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !type.trim() || !location.trim() || !landlordName.trim() || !landlordPhone.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const defaultImg = image.trim() || suggestedImages[category];

    // Build the format link for secure WhatsApp
    const waLink = `https://wa.me/${landlordPhone.trim().replace(/\s|\+/g, '')}?text=Olá!%20Vi%20o%20seu%20anúncio%20"${encodeURIComponent(title)}"%2520no%20MozRent%20e%20gostaria%20de%20conversar.`;

    onAddListing({
      category,
      title,
      description,
      type,
      price: Number(price),
      period,
      location,
      province,
      rooms: category === 'imovel' ? Number(rooms) : undefined,
      bathrooms: category === 'imovel' ? Number(bathrooms) : undefined,
      spaceArea: spaceArea.trim() || (category === 'imovel' ? "120 m²" : "N/A"),
      image: defaultImg,
      gallery: [defaultImg],
      features,
      landlordName,
      landlordPhone,
      landlordWhatsApp: waLink,
      availableNow: true,
      allowCredelecRefund: category === 'imovel' ? allowCredelecRefund : undefined
    });

    alert("Anúncio criado com sucesso! Ele já foi sincronizado com o MozRent local.");
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div 
        id="landlord-add-listing-modal"
        className="relative w-full max-w-2xl rounded-[32px] bg-white border border-natural-border shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-natural-border pb-4 mb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-brand-black">
              Anunciar no MozRent • Postar Bem
            </h2>
            <span className="text-xs text-[#6B665F] font-bold mt-1 block">
              Publique imóveis, veículos ou serviços para milhares de clientes hoje
            </span>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full bg-natural-aside p-2 text-[#6B665F] hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form elements with local scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 text-left">
          
          {/* Category Chooser */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-extrabold text-[#6B665F] mb-2">Categoria de Aluguer *</label>
            <div className="grid grid-cols-3 gap-2 text-center font-bold text-xs">
              <button
                type="button"
                onClick={() => {
                  setCategory("imovel");
                  setPeriod("mês");
                }}
                className={`rounded-2xl py-3 border transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  category === 'imovel' 
                    ? 'bg-emerald-50 text-[#00843D] border-brand-green shadow-xs ring-1 ring-brand-green' 
                    : 'bg-[#FAF5EE]/30 text-[#6B665F] border-natural-border'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Imóvel / Quarto</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory("veiculo");
                  setPeriod("dia");
                }}
                className={`rounded-2xl py-3 border transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  category === 'veiculo' 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-500 shadow-xs ring-1 ring-indigo-500' 
                    : 'bg-[#FAF5EE]/30 text-[#6B665F] border-natural-border'
                }`}
              >
                <Car className="h-4 w-4" />
                <span>Carro / 4x4</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory("equipamento");
                  setPeriod("dia");
                }}
                className={`rounded-2xl py-3 border transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  category === 'equipamento' 
                    ? 'bg-brand-yellow/10 text-[#B45309] border-brand-yellow shadow-xs ring-1 ring-brand-yellow/50' 
                    : 'bg-[#FAF5EE]/30 text-[#6B665F] border-natural-border'
                }`}
              >
                <Wrench className="h-4 w-4" />
                <span>Máquina / Salão</span>
              </button>
            </div>
          </div>

          {/* Core Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1">Título Curto e Atrativo *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Vivenda T3 com Quintal no Bairro da Coop"
                className="w-full rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-none placeholder:text-[#6B665F]/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1 font-sans">Tipo Específico *</label>
                <input
                  type="text"
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Ex: Vivenda, Trator, Hilux, etc"
                  className="w-full rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-none placeholder:text-[#6B665F]/60"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1 font-sans">Dimensão ou Capacidade</label>
                <input
                  type="text"
                  value={spaceArea}
                  onChange={(e) => setSpaceArea(e.target.value)}
                  placeholder={category === 'imovel' ? "Ex: 140 m²" : "Ex: 5 Lugares, 20 kVA, etc"}
                  className="w-full rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-none placeholder:text-[#6B665F]/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1">Preço em Meticais (MT) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1">Ciclo de Cobrança</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="w-full rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-none font-bold text-brand-black"
                >
                  <option value="mês" disabled={category !== 'imovel'}>Por Mês (Imóveis)</option>
                  <option value="dia">Por Dia (Carros/Equipamentos)</option>
                  <option value="evento">Por Evento (Salões)</option>
                </select>
              </div>
            </div>

            {/* Location & Province */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1">Província / Cidade *</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-none font-bold text-brand-black"
                >
                  {MOZAMBIQUE_PROVINCES.map((prov, i) => (
                    <option key={i} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1">Endereço Completo ou Bairro *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Sommerschield II, Av. Kenneth Kaunda"
                  className="w-full rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-none placeholder:text-[#6B665F]/60"
                />
              </div>
            </div>

            {/* If imovel, rooms and bathrooms */}
            {category === 'imovel' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1">Nº Quartos *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={rooms}
                    onChange={(e) => setRooms(Number(e.target.value) || 1)}
                    className="w-full rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1">Nº Casas de Banho *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value) || 1)}
                    className="w-full rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col justify-end pb-2">
                  <label className="inline-flex items-center gap-1.5 text-xs text-brand-black cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={allowCredelecRefund}
                      onChange={(e) => setAllowCredelecRefund(e.target.checked)}
                      className="rounded border-natural-border text-brand-green focus:ring-brand-green h-4 w-4"
                    />
                    <span>Reembolso Credelec?</span>
                  </label>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1">Descrição Completa *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Por favor descriva a infraestrutura, se há água do FIPAG com tanque, se a zona é segura e as condições gerais..."
                className="w-full rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-none"
              />
            </div>

            {/* Custom Features/Comodidades tag lists */}
            <div>
              <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1.5">Comodidades Destacadas</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Ex: Tanque de água, Garagem fechada, Ar condicionado"
                  className="flex-1 rounded-xl border border-natural-border bg-white px-3 py-2 text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="bg-brand-green hover:bg-emerald-800 text-white font-bold text-xs px-3 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {features.map((feat, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF5EE] text-brand-black text-[10px] px-3 py-1 font-bold border border-natural-border">
                    {feat}
                    <button type="button" onClick={() => removeFeature(i)} className="text-brand-red hover:text-red-900 font-bold ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Photo URLs */}
            <div>
              <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1">URL ou link da Foto Principal (Opcional)</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Insira um link de imagem ou deixe em branco para imagem sugerida"
                className="w-full rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-none"
              />
              <span className="text-[10px] text-[#6B665F] mt-1 block leading-normal font-medium">
                Sugestão opcional: se deixar vazio, usaremos uma foto de alta qualidade representativa da categoria.
              </span>
            </div>

            {/* Landlord Contact */}
            <div className="border-t border-dashed border-natural-border pt-4 mt-4 space-y-3">
              <h4 className="text-xs font-bold text-brand-black uppercase tracking-wide">
                Informações de Contacto Oficial
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1">Teu Nome / Empresa *</label>
                  <input
                    type="text"
                    required
                    value={landlordName}
                    onChange={(e) => setLandlordName(e.target.value)}
                    placeholder="Ex: Corrector Abel"
                    className="w-full rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-none placeholder:text-[#6B665F]/60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[#6B665F] uppercase mb-1">Telemóvel (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={landlordPhone}
                    onChange={(e) => setLandlordPhone(e.target.value)}
                    placeholder="Ex: 84xxxxxxx"
                    className="w-full rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-none placeholder:text-[#6B665F]/60"
                  />
                </div>
              </div>
              <p className="text-[10px] text-[#6B665F] flex items-start gap-1 leading-normal font-medium">
                <ShieldCheck className="h-4 w-4 text-brand-green flex-shrink-0" />
                <span>
                  O MozRent gerará automaticamente links directos seguros para os utilizadores telefonarem ou iniciarem uma conversa instantânea convosco sem custos adicionais.
                </span>
              </p>
            </div>

          </div>

          {/* Submit */}
          <div className="pt-4 pb-2 border-t border-natural-border flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-natural-border py-3 text-xs font-bold text-[#6B665F] hover:bg-natural-aside transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-brand-green hover:bg-emerald-800 text-white py-3 text-xs font-extrabold transition-all shadow cursor-pointer"
            >
              Publicar Anúncio Agora
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
