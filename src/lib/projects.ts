import { createClient } from "@/utils/supabase/server";

/**
 * Ensures a project exists for the given user, returning its ID.
 * If one with this name does not exist, it creates a new one.
 */
export async function getOrCreateProject(projectName: string): Promise<string> {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Você precisa estar logado para salvar. Faça login e tente novamente.");
  }

  const userId = authData.user.id;
  const userEmail = authData.user.email ?? `${userId}@user.com`;

  // Ensure the user exists in public.users (FK required by projects table).
  // The trigger on_auth_user_created handles this at sign-up, but may be missing
  // for users created before the trigger was set up.
  await supabase
    .from("users")
    .upsert({ id: userId, email: userEmail }, { onConflict: "id", ignoreDuplicates: true });
  // Non-fatal: if RLS blocks the upsert the user row already exists.

  // Check if project exists
  const { data: existingProject, error: fetchError } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", userId)
    .eq("name", projectName)
    .single();

  if (existingProject) {
    return existingProject.id;
  }

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 means zero rows found, we can safely ignore that specific error.
    console.error("Error fetching project:", fetchError);
    throw new Error("Failed to verify project existance.");
  }

  // Does not exist, create it
  const { data: newProject, error: insertError } = await supabase
    .from("projects")
    .insert([{ user_id: userId, name: projectName }])
    .select("id")
    .single();

  if (insertError || !newProject) {
    console.error("Error creating project:", insertError);
    throw new Error("Failed to create new project.");
  }

  return newProject.id;
}

/**
 * Saves a generated AI payload to the generations table.
 */
export async function saveGenerationToDatabase(
  projectName: string,
  moduleType: string,
  inputParams: any = {},
  outputData: any = {}
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const projectId = await getOrCreateProject(projectName);
    const supabase = await createClient();
    
    // Safety check again to get user_id (required by RLS)
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("generations")
      .insert([
        {
          project_id: projectId,
          user_id: user!.id,
          module_type: moduleType,
          input_params: inputParams,
          output_data: outputData,
        }
      ]);

    if (error) {
       console.error("Failed to insert generation:", error);
       throw error;
    }

    return { success: true, message: `Successfully saved to ${projectName}!` };
  } catch (err: any) {
    console.error("Failed to save generation globally:", err);
    return { success: false, error: err.message || "Failed to save generation." };
  }
}
