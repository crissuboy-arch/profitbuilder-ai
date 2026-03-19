import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { Bot, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { ModuleGenerationCard } from "./ModuleGenerationCard";

export default async function SingleProjectView({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Verify project ownership and get details
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <Link href="/dashboard/projects">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  // Fetch all generations for this project
  const { data: generations, error: genError } = await supabase
    .from("generations")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white shadow-sm border text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{project.name}</h1>
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2 mt-1">
            <Bot className="w-4 h-4" />
            Workspace initialized on {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-slate-800">Saved Intelligence</h2>
          <span className="bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1 rounded-full border border-violet-200">
            {generations?.length || 0} Assets
          </span>
        </div>
        
        {generations?.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
             <Bot className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-slate-800">No assets saved yet</h3>
             <p className="text-slate-500 max-w-xs mx-auto mt-2">
               Head to any AI module to start generating and saving assets to this workspace.
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {generations?.map((gen) => (
              <ModuleGenerationCard key={gen.id} gen={gen} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
