import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const demoEmail = "thayyib.demo.2026@gmail.com";
const demoPassword = "ThayyibDemo123!";
const seedWarnings = [];

const supplierSeeds = [
  {
    name: "Global Meats Inc.",
    category: "Poultry",
    contact_person: "Sarah Jenkins",
    contact_email: "compliance@globalmeats.example",
    phone: "+60 3-5550 1201",
    certificate_status: "valid",
    certificate_expiry_date: "2026-10-12",
    notes: "Primary poultry supplier. Certificate checked during onboarding.",
  },
  {
    name: "Crescent Dairy",
    category: "Dairy Products",
    contact_person: "Omar Farooq",
    contact_email: "omar@crescentdairy.example",
    phone: "+60 3-5550 1202",
    certificate_status: "expiring_soon",
    certificate_expiry_date: "2026-07-10",
    notes: "Renewal certificate requested before the next internal audit.",
  },
  {
    name: "Eastern Spices Co.",
    category: "Spices & Seasonings",
    contact_person: "Aisha Khan",
    contact_email: "qa@easternspices.example",
    phone: "+60 3-5550 1203",
    certificate_status: "valid",
    certificate_expiry_date: "2027-05-15",
    notes: "Supplier provides spice blends and annual facility evidence.",
  },
  {
    name: "Prime Ingredients",
    category: "Additives",
    contact_person: "David Chen",
    contact_email: "david@primeingredients.example",
    phone: "+60 3-5550 1204",
    certificate_status: "expired",
    certificate_expiry_date: "2026-05-30",
    notes: "Certificate has expired. Follow up before accepting new shipments.",
  },
  {
    name: "Pure Extracts Ltd.",
    category: "Flavorings",
    contact_person: "Linda Roberts",
    contact_email: "linda@pureextracts.example",
    phone: "+60 3-5550 1205",
    certificate_status: "missing_certificate",
    certificate_expiry_date: null,
    notes: "Flavoring supplier needs a current halal certificate uploaded.",
  },
];

const notificationSeeds = [
  {
    title: "Crescent Dairy certificate expires soon",
    detail: "Certificate expires on Jul 10, 2026.",
    priority: "High",
    is_read: false,
    created_at: "2026-06-28T09:00:00.000Z",
  },
  {
    title: "Prime Ingredients certificate expired",
    detail: "Please upload an updated supplier certificate.",
    priority: "High",
    is_read: false,
    created_at: "2026-06-27T09:00:00.000Z",
  },
  {
    title: "Q3 sanitation SOP needs review",
    detail: "Checklist item is waiting for updated evidence.",
    priority: "Medium",
    is_read: true,
    created_at: "2026-06-25T09:00:00.000Z",
  },
  {
    title: "Eastern Spices Co. documents updated",
    detail: "New audit evidence was linked to the supplier profile.",
    priority: "Info",
    is_read: true,
    created_at: "2026-06-22T09:00:00.000Z",
  },
];

function readEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");

  try {
    return readFileSync(envPath, "utf8");
  } catch {
    throw new Error(
      "Missing .env.local. Create apps/web/.env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
}

function parseEnv(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        const key = line.slice(0, separatorIndex);
        const value = line.slice(separatorIndex + 1).replace(/^["']|["']$/g, "");
        return [key, value];
      }),
  );
}

const env = parseEnv(readEnvFile());
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Supabase env values are incomplete. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in apps/web/.env.local.",
  );
}

const supabase = createClient(supabaseUrl, supabasePublishableKey);

try {
  const { error: signUpError } = await supabase.auth.signUp({
    email: demoEmail,
    password: demoPassword,
    options: {
      data: {
        full_name: "Demo Compliance Officer",
        company_name: "Thayyib Demo Foods",
      },
    },
  });

  const signUpMessage = signUpError?.message.toLowerCase() ?? "";
  const canTryExistingUser =
    signUpMessage.includes("already") || signUpMessage.includes("rate limit");

  if (signUpError && !canTryExistingUser) {
    throw signUpError;
  }

  if (signUpError?.message) {
    console.log("Signup note:", signUpError.message);
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  });

  if (signInError) {
    console.log("Demo user was created or already exists.");
    console.log("Login is not ready yet:", signInError.message);
    console.log(
      "If this says email is not confirmed, disable email confirmation in Supabase Auth settings for local demos or confirm the user in the Supabase dashboard.",
    );
  } else {
    const { data: companyId, error: workspaceError } = await supabase.rpc(
      "ensure_user_workspace",
    );

    if (workspaceError) {
      console.log("Demo user is ready, but workspace seeding did not run.");
      console.log("Workspace note:", workspaceError.message);
      console.log(
        "Run the latest supabase/schema.sql in Supabase SQL editor, then run this script again.",
      );
    } else {
      await seedDemoWorkspace(supabase, companyId, signInData.session.user.id);

      const { supplierCount, documentCount, notificationCount } =
        await getWorkspaceCounts(supabase, companyId);

      console.log("Demo workspace is ready.");
      console.log(`Mock suppliers: ${supplierCount ?? 0}`);
      console.log(`Mock documents: ${documentCount ?? 0}`);
      console.log(`Mock notifications: ${notificationCount ?? 0}`);

      if (seedWarnings.length > 0) {
        console.log("");
        console.log("Seed warnings:");
        for (const warning of seedWarnings) {
          console.log(`- ${warning}`);
        }
      }
    }
  }
} catch (error) {
  console.log("Could not create the demo user.");
  console.log(error.message);
  process.exitCode = 1;
}

if (process.exitCode) {
  console.log("");
  console.log("Try using an email domain accepted by your Supabase Auth settings.");
} else {
  console.log("");
}

console.log(`Username: ${demoEmail}`);
console.log(`Password: ${demoPassword}`);

async function seedDemoWorkspace(supabaseClient, companyId, userId) {
  await seedSuppliers(supabaseClient, companyId);
  const suppliersByName = await getSuppliersByName(supabaseClient, companyId);
  await seedDocuments(supabaseClient, companyId, userId, suppliersByName);
  const documentsByName = await getDocumentsByName(supabaseClient, companyId);
  await seedChecklist(supabaseClient, companyId, documentsByName);
  await seedNotifications(supabaseClient, companyId);
  await seedActivityLogs(supabaseClient, companyId, userId, documentsByName, suppliersByName);
}

async function seedSuppliers(supabaseClient, companyId) {
  const existingNames = await getExistingValues(
    supabaseClient,
    "suppliers",
    companyId,
    "name",
    supplierSeeds.map((supplier) => supplier.name),
  );
  const missingSuppliers = supplierSeeds
    .filter((supplier) => !existingNames.has(supplier.name))
    .map((supplier) => ({
      ...supplier,
      company_id: companyId,
    }));

  if (missingSuppliers.length === 0) {
    return;
  }

  const { error } = await supabaseClient.from("suppliers").insert(missingSuppliers);

  if (error) {
    throw error;
  }
}

async function seedDocuments(supabaseClient, companyId, userId, suppliersByName) {
  const documentSeeds = [
    {
      supplier_id: suppliersByName.get("Global Meats Inc.")?.id ?? null,
      name: "Global Meats Halal Certificate",
      document_type: "supplier_certificate",
      status: "valid",
      expiry_date: "2026-10-12",
      file_name: "global-meats-halal-certificate-2026.pdf",
      created_at: "2026-06-18T09:00:00.000Z",
    },
    {
      supplier_id: suppliersByName.get("Crescent Dairy")?.id ?? null,
      name: "Crescent Dairy Renewal Certificate",
      document_type: "supplier_certificate",
      status: "expiring_soon",
      expiry_date: "2026-07-10",
      file_name: "crescent-dairy-renewal-certificate.pdf",
      created_at: "2026-05-29T09:00:00.000Z",
    },
    {
      supplier_id: null,
      name: "Q3 Sanitation Standard Operating Procedure",
      document_type: "sop_document",
      status: "needs_review",
      expiry_date: null,
      file_name: "q3-sanitation-sop.docx",
      created_at: "2026-06-02T09:00:00.000Z",
    },
    {
      supplier_id: suppliersByName.get("Pure Extracts Ltd.")?.id ?? null,
      name: "Ingredient Traceability Log - Batch A124",
      document_type: "ingredient_list",
      status: "complete",
      expiry_date: null,
      file_name: "ingredient-traceability-batch-a124.xlsx",
      created_at: "2026-06-21T09:00:00.000Z",
    },
    {
      supplier_id: suppliersByName.get("Prime Ingredients")?.id ?? null,
      name: "Prime Ingredients Certificate",
      document_type: "supplier_certificate",
      status: "expired",
      expiry_date: "2026-05-30",
      file_name: "prime-ingredients-certificate.pdf",
      created_at: "2026-01-05T09:00:00.000Z",
    },
  ];
  const existingNames = await getExistingValues(
    supabaseClient,
    "documents",
    companyId,
    "name",
    documentSeeds.map((document) => document.name),
  );
  const missingDocuments = documentSeeds
    .filter((document) => !existingNames.has(document.name))
    .map((document) => ({
      ...document,
      company_id: companyId,
      uploaded_by: userId,
    }));

  if (missingDocuments.length === 0) {
    return;
  }

  const { error } = await supabaseClient.from("documents").insert(missingDocuments);

  if (error) {
    throw error;
  }
}

async function seedChecklist(supabaseClient, companyId, documentsByName) {
  const checklistSeeds = [
    {
      category: "Supplier Certificates",
      title: "Cross-contamination prevention agreements signed",
      description: "Supplier agreements are collected for active suppliers.",
      status: "complete",
      linked_document_id: documentsByName.get("Global Meats Halal Certificate")?.id ?? null,
      sort_order: 5,
    },
    {
      category: "Supplier Certificates",
      title: "Annual facility audit reports collected",
      description: "Missing 1 document from Prime Ingredients.",
      status: "missing_document",
      linked_document_id: null,
      sort_order: 6,
    },
    {
      category: "SOP Documents",
      title: "Sanitation Standard Operating Procedure",
      description: "Needs Q3 update.",
      status: "needs_review",
      linked_document_id:
        documentsByName.get("Q3 Sanitation Standard Operating Procedure")?.id ?? null,
      sort_order: 7,
    },
  ];
  const existingTitles = await getExistingValues(
    supabaseClient,
    "audit_checklist_items",
    companyId,
    "title",
    checklistSeeds.map((item) => item.title),
  );
  const missingItems = checklistSeeds
    .filter((item) => !existingTitles.has(item.title))
    .map((item) => ({
      ...item,
      company_id: companyId,
    }));

  if (missingItems.length > 0) {
    const { error } = await supabaseClient
      .from("audit_checklist_items")
      .insert(missingItems);

    if (error) {
      throw error;
    }
  }

  await updateChecklistItem(supabaseClient, companyId, {
    title: "Valid halal certificates for tier 1 suppliers",
    status: "complete",
    description:
      "Global Meats certificate verified. Crescent Dairy renewal is being tracked.",
    linked_document_id: documentsByName.get("Global Meats Halal Certificate")?.id ?? null,
  });
  await updateChecklistItem(supabaseClient, companyId, {
    title: "Ingredient traceability logs updated",
    status: "complete",
    description: "Batch A124 traceability log is uploaded.",
    linked_document_id:
      documentsByName.get("Ingredient Traceability Log - Batch A124")?.id ?? null,
  });
  await updateChecklistItem(supabaseClient, companyId, {
    title: "Halal Assurance System manual uploaded",
    status: "complete",
    description: "HAS manual placeholder is recorded for the demo workspace.",
  });
  await updateChecklistItem(supabaseClient, companyId, {
    title: "Recent internal audit evidence uploaded",
    status: "missing_document",
    description: "Attach evidence from recent checks and corrective actions.",
  });
}

async function seedNotifications(supabaseClient, companyId) {
  const existingTitles = await getExistingValues(
    supabaseClient,
    "notifications",
    companyId,
    "title",
    notificationSeeds.map((notification) => notification.title),
  );
  const missingNotifications = notificationSeeds
    .filter((notification) => !existingTitles.has(notification.title))
    .map((notification) => ({
      ...notification,
      company_id: companyId,
    }));

  if (missingNotifications.length === 0) {
    return;
  }

  const { error } = await supabaseClient
    .from("notifications")
    .insert(missingNotifications);

  if (error) {
    seedWarnings.push(
      `Notifications were not inserted: ${error.message}. Run the latest supabase/schema.sql to add the notification insert policy, then run this script again.`,
    );
  }
}

async function seedActivityLogs(
  supabaseClient,
  companyId,
  userId,
  documentsByName,
  suppliersByName,
) {
  const activitySeeds = [
    {
      action: "Created demo supplier workspace",
      entity_type: "company",
      entity_id: companyId,
      created_at: "2026-06-18T09:00:00.000Z",
    },
    {
      action: "Uploaded Global Meats certificate metadata",
      entity_type: "document",
      entity_id: documentsByName.get("Global Meats Halal Certificate")?.id ?? null,
      created_at: "2026-06-18T09:05:00.000Z",
    },
    {
      action: "Flagged Prime Ingredients expired certificate",
      entity_type: "supplier",
      entity_id: suppliersByName.get("Prime Ingredients")?.id ?? null,
      created_at: "2026-06-27T09:00:00.000Z",
    },
  ];
  const existingActions = await getExistingValues(
    supabaseClient,
    "activity_logs",
    companyId,
    "action",
    activitySeeds.map((activity) => activity.action),
  );
  const missingActivities = activitySeeds
    .filter((activity) => !existingActions.has(activity.action))
    .map((activity) => ({
      ...activity,
      company_id: companyId,
      user_id: userId,
    }));

  if (missingActivities.length === 0) {
    return;
  }

  const { error } = await supabaseClient
    .from("activity_logs")
    .insert(missingActivities);

  if (error) {
    throw error;
  }
}

async function getExistingValues(supabaseClient, table, companyId, column, values) {
  const { data, error } = await supabaseClient
    .from(table)
    .select(column)
    .eq("company_id", companyId)
    .in(column, values);

  if (error) {
    throw error;
  }

  return new Set(data.map((row) => row[column]));
}

async function getSuppliersByName(supabaseClient, companyId) {
  const { data, error } = await supabaseClient
    .from("suppliers")
    .select("id,name")
    .eq("company_id", companyId);

  if (error) {
    throw error;
  }

  return new Map(data.map((supplier) => [supplier.name, supplier]));
}

async function getDocumentsByName(supabaseClient, companyId) {
  const { data, error } = await supabaseClient
    .from("documents")
    .select("id,name")
    .eq("company_id", companyId);

  if (error) {
    throw error;
  }

  return new Map(data.map((document) => [document.name, document]));
}

async function updateChecklistItem(supabaseClient, companyId, item) {
  const { title, ...updates } = item;
  const { error } = await supabaseClient
    .from("audit_checklist_items")
    .update(updates)
    .eq("company_id", companyId)
    .eq("title", title);

  if (error) {
    throw error;
  }
}

async function getWorkspaceCounts(supabaseClient, companyId) {
  const [
    { count: supplierCount },
    { count: documentCount },
    { count: notificationCount },
  ] = await Promise.all([
    supabaseClient
      .from("suppliers")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId),
    supabaseClient
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId),
    supabaseClient
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId),
  ]);

  return {
    supplierCount,
    documentCount,
    notificationCount,
  };
}
