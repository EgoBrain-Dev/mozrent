"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { PROPERTY_TYPES, BAIRROS_MAPUTO, AMENIDADES } from "@/types";
import { motion } from "framer-motion";
import { Upload, X, ImagePlus, Check, Loader2, Edit3 } from "lucide-react";

export default function PublicarPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEditing);
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenidades, setSelectedAmenidades] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    bairro: "",
    cidade: "Maputo",
    preco: "",
    tipo: "quarto",
    descricao: "",
  });

  // Load existing property data if editing
  useEffect(() => {
    if (!editId) return;
    const loadProperty = async () => {
      try {
        const docSnap = await getDoc(doc(db, "properties", editId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            title: data.title || "",
            bairro: data.bairro || "",
            cidade: data.cidade || "Maputo",
            preco: data.preco?.toString() || "",
            tipo: data.tipo || "quarto",
            descricao: data.descricao || "",
          });
          setImages(data.imagens || []);
          setSelectedAmenidades(data.amenidades || []);
        }
      } catch (err) {
        console.error("Erro ao carregar anúncio:", err);
      } finally {
        setLoadingEdit(false);
      }
    };
    loadProperty();
  }, [editId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "mozrent_unsigned");
      formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dgdxox5ty");

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dgdxox5ty"}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) {
          setImages((prev) => [...prev, data.secure_url]);
        }
      } catch (err) {
        console.error("Erro no upload:", err);
      }
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenidade = (a: string) => {
    setSelectedAmenidades((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const propertyData = {
        ...form,
        preco: Number(form.preco),
        imagens: images,
        amenidades: selectedAmenidades,
      };

      if (isEditing && editId) {
        // Update existing property
        await updateDoc(doc(db, "properties", editId), propertyData);
      } else {
        // Create new property
        await addDoc(collection(db, "properties"), {
          ...propertyData,
          ownerId: user.uid,
          ownerName: profile.nome,
          ownerPhone: profile.telefone,
          status: "active",
          featured: false,
          createdAt: serverTimestamp(),
        });
      }
      router.push("/perfil");
    } catch (err) {
      console.error("Erro ao publicar:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Faça login primeiro</h2>
        <p className="text-gray-400 mb-6">Precisa estar autenticado para publicar.</p>
        <button onClick={() => router.push("/login")} className="btn-primary">Entrar</button>
      </div>
    );
  }

  if (loadingEdit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          {isEditing && (
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-primary-400" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isEditing ? "Editar Anúncio" : "Publicar Anúncio"}
            </h1>
            <p className="text-gray-400">
              {isEditing ? "Atualize os detalhes do seu imóvel" : "Preencha os detalhes do seu imóvel"}
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        {/* Fotos */}
        <div className="glass-card p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-secondary-400" /> Fotos
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-secondary-400/50 transition-colors">
              {uploading ? <Loader2 className="w-6 h-6 text-gray-500 animate-spin" /> : <Upload className="w-6 h-6 text-gray-500" />}
              <span className="text-xs text-gray-500 mt-1">Adicionar</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <p className="text-gray-500 text-xs">Adicione até 10 fotos do imóvel. A primeira será a foto de capa.</p>
        </div>

        {/* Detalhes */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-white font-semibold mb-2">Detalhes</h3>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Título do anúncio</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-glass" placeholder="Ex: Quarto mobilado no Sommerschield" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="input-glass cursor-pointer">
                {Object.entries(PROPERTY_TYPES).map(([k, v]) => (
                  <option key={k} value={k} className="bg-dark-800">{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Preço mensal (MZN)</label>
              <input type="number" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} className="input-glass" placeholder="15000" required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Bairro</label>
              <select value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} className="input-glass cursor-pointer" required>
                <option value="" className="bg-dark-800">Selecionar</option>
                {BAIRROS_MAPUTO.map((b) => (
                  <option key={b} value={b} className="bg-dark-800">{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Cidade</label>
              <input type="text" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className="input-glass" />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Descrição</label>
            <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="input-glass min-h-[120px] resize-y" placeholder="Descreva o imóvel em detalhe..." required />
          </div>
        </div>

        {/* Amenidades */}
        <div className="glass-card p-6">
          <h3 className="text-white font-semibold mb-4">Comodidades</h3>
          <div className="flex flex-wrap gap-2">
            {AMENIDADES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenidade(a)}
                className={`px-3 py-2 rounded-lg text-sm border cursor-pointer transition-all flex items-center gap-1 ${
                  selectedAmenidades.includes(a)
                    ? "border-secondary-400 bg-secondary-500/10 text-secondary-300"
                    : "border-white/10 bg-transparent text-gray-400 hover:border-white/20"
                }`}
              >
                {selectedAmenidades.includes(a) && <Check className="w-3 h-3" />}
                {a}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-secondary w-full justify-center text-lg !py-4 disabled:opacity-50">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> {isEditing ? "A atualizar..." : "A publicar..."}</>
          ) : (
            isEditing ? "Guardar Alterações" : "Publicar Anúncio"
          )}
        </button>
      </form>
    </div>
  );
}
