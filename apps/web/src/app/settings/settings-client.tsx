"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Bell,
  Building2,
  ImagePlus,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import {
  saveNotificationPreferencesAction,
  updateCompanyAction,
  updateUserProfileAction,
} from "@/app/actions";
import { Card, PrimaryButton } from "@/components/ui";
import type { Company } from "@/lib/data/types";

const tabs = [
  { label: "Company Profile", icon: Building2 },
  { label: "User Profile", icon: User },
  { label: "Team Members", icon: Users },
  { label: "Roles & Permissions", icon: ShieldCheck },
  { label: "Notifications", icon: Bell },
];

export function SettingsClient({
  company,
  setupMode,
}: {
  company: Company;
  setupMode: boolean;
}) {
  const [activeTab, setActiveTab] = useState(tabs[0].label);
  const [logoName, setLogoName] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
      <Card className="p-3">
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                tab.label === activeTab
                  ? "bg-surface-soft text-primary"
                  : "text-slate-700 hover:bg-surface-soft"
              }`}
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              type="button"
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </Card>

      {activeTab === "Company Profile" && (
        <CompanyPanel
          company={company}
          logoName={logoName}
          onLogoChange={setLogoName}
          setupMode={setupMode}
        />
      )}
      {activeTab === "User Profile" && <UserPanel setupMode={setupMode} />}
      {activeTab === "Team Members" && (
        <TeamPanel
          inviteMessage={inviteMessage}
          onInvite={(message) => setInviteMessage(message)}
          setupMode={setupMode}
        />
      )}
      {activeTab === "Roles & Permissions" && <RolesPanel />}
      {activeTab === "Notifications" && <NotificationPanel setupMode={setupMode} />}
    </section>
  );
}

function CompanyPanel({
  company,
  logoName,
  onLogoChange,
  setupMode,
}: {
  company: Company;
  logoName: string;
  onLogoChange: (name: string) => void;
  setupMode: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <form action={updateCompanyAction}>
        <PanelHeader
          description="General information about your organization."
          title="Company Profile"
        >
          <PrimaryButton className={setupMode ? "pointer-events-none opacity-50" : ""}>
            Save Changes
          </PrimaryButton>
        </PanelHeader>

        <div className="space-y-8 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-surface-soft text-primary">
              <ImagePlus className="h-7 w-7" />
              <span className="mt-2 text-xs font-semibold">Upload Logo</span>
              <input
                accept=".png,.jpg,.jpeg"
                className="sr-only"
                disabled={setupMode}
                onChange={(event) => onLogoChange(event.target.files?.[0]?.name ?? "")}
                type="file"
              />
            </label>
            <div>
              <p className="font-semibold text-slate-950">Company Logo</p>
              <p className="mt-1 text-sm text-slate-600">
                Recommended size 256x256px. PNG or JPG.
              </p>
              <p className="mt-3 text-sm font-medium text-primary">
                {logoName ? `Selected: ${logoName}` : "No logo selected yet"}
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Company Name" name="name" value={company.name} />
            <Field
              label="Registration Number"
              name="registrationNumber"
              value={company.registrationNumber}
            />
            <Field
              className="md:col-span-2"
              label="Headquarters Address"
              name="address"
              value={company.address}
            />
            <Field
              label="Industry Sector"
              name="industrySector"
              value={company.industrySector}
            />
            <Field
              label="Primary Contact Email"
              name="primaryContactEmail"
              type="email"
              value={company.primaryContactEmail}
            />
          </div>
        </div>
      </form>
    </Card>
  );
}

function UserPanel({ setupMode }: { setupMode: boolean }) {
  return (
    <Card className="overflow-hidden">
      <form action={updateUserProfileAction}>
        <PanelHeader
          description="Store basic profile metadata on your Supabase Auth user."
          title="User Profile"
        >
          <PrimaryButton className={setupMode ? "pointer-events-none opacity-50" : ""}>
            Save Profile
          </PrimaryButton>
        </PanelHeader>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Field label="Full Name" name="fullName" value="Compliance Officer" />
          <Field label="Job Title" name="jobTitle" value="Halal Compliance Officer" />
          <Field label="Phone" name="phone" required={false} value="" />
        </div>
      </form>
    </Card>
  );
}

function TeamPanel({
  inviteMessage,
  onInvite,
  setupMode,
}: {
  inviteMessage: string;
  onInvite: (message: string) => void;
  setupMode: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <PanelHeader
        description="Prepare team access. Full invitation email delivery can be added later."
        title="Team Members"
      />
      <div className="space-y-6 p-6">
        <form
          className="grid gap-4 md:grid-cols-[1fr_180px_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const email = String(formData.get("email") ?? "");
            const role = String(formData.get("role") ?? "");
            onInvite(`Invite prepared for ${email} as ${role}.`);
            event.currentTarget.reset();
          }}
        >
          <Field label="Email" name="email" type="email" value="" />
          <label className="block">
            <span className="text-sm font-semibold text-slate-900">Role</span>
            <select
              className="mt-2 h-12 w-full rounded-lg border border-border bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              name="role"
            >
              <option>Compliance Officer</option>
              <option>Manager</option>
              <option>Auditor</option>
            </select>
          </label>
          <button
            className="mt-7 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:bg-slate-300"
            disabled={setupMode}
          >
            Prepare Invite
          </button>
        </form>
        {inviteMessage && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-success">
            {inviteMessage}
          </div>
        )}
      </div>
    </Card>
  );
}

function RolesPanel() {
  const roles = [
    ["Admin", "Manage company settings and all modules."],
    ["Compliance Officer", "Manage suppliers, documents, inventory, and audits."],
    ["Manager", "View dashboards and reports."],
    ["Auditor", "Read-only evidence review."],
  ];

  return (
    <Card className="overflow-hidden">
      <PanelHeader
        description="Role definitions for the current MVP workspace."
        title="Roles & Permissions"
      />
      <div className="divide-y divide-border">
        {roles.map(([role, description]) => (
          <div className="flex items-center justify-between gap-4 px-6 py-4" key={role}>
            <div>
              <p className="font-semibold text-slate-950">{role}</p>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
            <span className="rounded-full bg-surface-soft px-3 py-1 text-sm text-slate-600">
              Active
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function NotificationPanel({ setupMode }: { setupMode: boolean }) {
  return (
    <Card className="overflow-hidden">
      <form action={saveNotificationPreferencesAction}>
        <PanelHeader
          description="Choose which operational reminders should be emphasized."
          title="Notification Preferences"
        >
          <PrimaryButton className={setupMode ? "pointer-events-none opacity-50" : ""}>
            Save Preferences
          </PrimaryButton>
        </PanelHeader>
        <div className="space-y-4 p-6">
          {[
            "Certificate expiry reminders",
            "Missing document reminders",
            "Inventory risk reminders",
            "Audit checklist updates",
          ].map((label) => (
            <label
              className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
              key={label}
            >
              <span className="font-medium text-slate-900">{label}</span>
              <input
                className="h-5 w-5 accent-primary"
                defaultChecked
                name="preferences"
                type="checkbox"
                value={label}
              />
            </label>
          ))}
        </div>
      </form>
    </Card>
  );
}

function PanelHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border bg-surface-soft/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  className = "",
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  value: string;
  className?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-lg border border-border bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        defaultValue={value}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}
