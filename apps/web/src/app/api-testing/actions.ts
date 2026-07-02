"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentCompanyId } from "@/lib/data/app-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function runHalalApiSmokeTestAction() {
  if (!hasSupabaseEnv()) {
    redirect("/api-testing?error=Supabase%20is%20not%20configured");
  }

  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    redirect("/api-testing?error=Company%20workspace%20not%20found");
  }

  const supabase = await createClient();
  const { data: createdRows, error: createError } = await supabase
    .from("halal_ai_assessments")
    .insert({
      company_id: companyId,
      product_name: "API Smoke Test Product",
      brand_name: "Thayyib QA",
      input_text: "Ingredients: flour, sugar, gelatin.",
      detected_ingredients: [
        {
          name: "Gelatin",
          risk_level: "high",
        },
      ],
      risk_summary:
        "API smoke test row. Gelatin requires supplier source verification.",
      risk_level: "high",
      recommendation_text:
        "Potential risk detected. Please verify with a qualified halal compliance officer.",
      sources: [
        {
          title: "API Testing Page",
          url: "/api-testing",
        },
      ],
      confidence_score: 0.76,
      model_name: "api-testing-smoke-test",
      is_sample_data: true,
    })
    .select("id")
    .single<{ id: string }>();

  if (createError || !createdRows) {
    redirect(
      `/api-testing?error=${encodeURIComponent(
        createError?.message ?? "Create smoke test failed",
      )}`,
    );
  }

  const { error: updateError } = await supabase
    .from("halal_ai_assessments")
    .update({
      risk_summary:
        "API smoke test update succeeded. Temporary row will be deleted.",
      confidence_score: 0.8,
    })
    .eq("id", createdRows.id);

  if (updateError) {
    await supabase.from("halal_ai_assessments").delete().eq("id", createdRows.id);
    redirect(`/api-testing?error=${encodeURIComponent(updateError.message)}`);
  }

  const { error: deleteError } = await supabase
    .from("halal_ai_assessments")
    .delete()
    .eq("id", createdRows.id);

  if (deleteError) {
    redirect(`/api-testing?error=${encodeURIComponent(deleteError.message)}`);
  }

  revalidatePath("/api-testing");
  redirect("/api-testing?message=POST%2C%20PATCH%2C%20DELETE%20smoke%20test%20passed");
}
