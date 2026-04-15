import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProjectsDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*, generations(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-[family-name:var(--font-geist-sans)]">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
        <p className="text-muted-foreground">
          View all your organized AI workspaces.
        </p>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-500 rounded-md">Error loading projects.</div>
      ) : projects?.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed">
          <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No projects yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-1">
            Generate your first idea, sales page, or content piece inside any module to automatically create a workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="hover:border-violet-300 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-violet-500" />
                    {project.name}
                  </CardTitle>
                  <CardDescription>
                    {project.generations[0]?.count || 0} Saved Generation
                    {(project.generations[0]?.count !== 1) ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Last updated {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
