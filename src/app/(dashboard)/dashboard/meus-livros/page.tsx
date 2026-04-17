"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getMyBooks, deleteBook, type SavedBook } from "@/app/(dashboard)/dashboard/modules/book-generator/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  BookOpen, Loader2, Trash2, Edit3, ArrowLeft,
  Calendar, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MeusLivrosPage() {
  const [books, setBooks] = useState<SavedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    const { success, data, error } = await getMyBooks();
    if (success && data) {
      setBooks(data);
    } else if (error) {
      toast.error(error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este livro?")) return;
    setDeletingId(id);
    const { success, error } = await deleteBook(id);
    if (success) {
      toast.success("Livro excluído!");
      setBooks(prev => prev.filter(b => b.id !== id));
    } else {
      toast.error(error ?? "Erro ao excluir.");
    }
    setDeletingId(null);
  }

  const colors: Record<string, string> = {
    Romance: "bg-rose-500",
    "Romance de Mafia": "bg-red-700",
    "CEO Romance": "bg-sky-500",
    "Dark Romance": "bg-purple-700",
    "Suspense Romântico": "bg-teal-500",
    Thriller: "bg-slate-500",
    Fantasia: "bg-violet-500",
    Autoajuda: "bg-amber-500",
    Contos: "bg-emerald-500",
    Emagrecimento: "bg-green-500",
    "Dieta e Nutrição": "bg-lime-500",
    Fitness: "bg-orange-500",
    "Gospel/Cristão": "bg-yellow-500",
    "Marketing Digital": "bg-blue-500",
    Finanças: "bg-emerald-600",
    Maternidade: "bg-pink-500",
    Autodesenvolvimento: "bg-indigo-500",
    Negócios: "bg-slate-600",
    Culinária: "bg-amber-600",
    Infantil: "bg-pink-400",
    Juvenil: "bg-cyan-500",
    Biografia: "bg-stone-500",
    Motivacional: "bg-yellow-500",
    Espiritualidade: "bg-violet-500",
    Relacionamentos: "bg-rose-500",
    Educação: "bg-blue-500",
    História: "bg-stone-600",
    Tecnologia: "bg-sky-500",
  };

  function getGenreColor(genre: string): string {
    return colors[genre] ?? "bg-indigo-500";
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/modules/book-generator">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="p-3 bg-indigo-600/10 rounded-2xl">
          <BookOpen className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Meus Livros</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Livros salvos da sua biblioteca
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
          <p className="text-muted-foreground">Carregando livros...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-600">Nenhum livro salvo</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            Gere um livro e clique em "Salvar" para vê-lo aqui
          </p>
          <Link href="/dashboard/modules/book-generator">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <BookOpen className="w-4 h-4 mr-2" />
              Criar novo livro
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(book => (
            <Card
              key={book.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Book cover placeholder */}
              <div
                className={cn(
                  "h-40 flex items-center justify-center text-white/30 relative overflow-hidden"
                )}
                style={{ backgroundColor: getGenreColor(book.genre) }}
              >
                <BookOpen className="w-16 h-16 opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                    {book.genre}
                  </span>
                </div>
              </div>

              <CardContent className="p-5">
                <h3 className="font-bold text-base line-clamp-2 mb-1">{book.title}</h3>
                {book.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                    {book.subtitle}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mb-3">
                  por {book.author} · {book.page_size}p
                </p>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <Calendar className="w-3 h-3" />
                  {formatDate(book.created_at)}
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/modules/book-generator?edit=${book.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs"
                      onClick={() => setEditingId(book.id)}
                      disabled={editingId === book.id}
                    >
                      {editingId === book.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Edit3 className="w-3 h-3 mr-1.5" />
                          Editar
                        </>
                      )}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(book.id)}
                    disabled={deletingId === book.id}
                  >
                    {deletingId === book.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state bottom link */}
      {!loading && books.length > 0 && (
        <div className="mt-8 text-center">
          <Link href="/dashboard/modules/book-generator">
            <Button variant="outline" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Criar novo livro
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
