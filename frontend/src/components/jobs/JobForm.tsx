"use client";

import { useState } from "react";
import { Job, JobInput } from "@/types";
import { Input, TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { X, Plus } from "lucide-react";
import { createJob } from "@/lib/api";

interface JobFormProps {
  onJobCreated: (job: Job) => void;
}

export function JobForm({ onJobCreated }: JobFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<JobInput>({
    title: "",
    company: "",
    description: "",
    requiredSkills: [],
    preferredSkills: [],
    minExperience: 0,
    maxExperience: 5,
  });
  const [requiredInput, setRequiredInput] = useState("");
  const [preferredInput, setPreferredInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof JobInput, string>>>({});

  const addSkill = (
    type: "requiredSkills" | "preferredSkills",
    value: string,
    setter: (v: string) => void
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (form[type].includes(trimmed)) return;
    setForm((prev) => ({ ...prev, [type]: [...prev[type], trimmed] }));
    setter("");
  };

  const removeSkill = (type: "requiredSkills" | "preferredSkills", skill: string) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].filter((s) => s !== skill),
    }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Job title is required";
    if (!form.company.trim()) e.company = "Company name is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (form.requiredSkills.length === 0) e.requiredSkills = "Add at least one required skill";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await createJob(form);
    setLoading(false);
    if (result.data) {
      onJobCreated(result.data);
      setForm({
        title: "",
        company: "",
        description: "",
        requiredSkills: [],
        preferredSkills: [],
        minExperience: 0,
        maxExperience: 5,
      });
      setErrors({});
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-slate-200 shadow-sm"
    >
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">
          Create Job Description
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Define the role and required skills for AI matching
        </p>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Job Title"
            placeholder="e.g. Senior ML Engineer"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            error={errors.title}
            id="job-title"
          />
          <Input
            label="Company"
            placeholder="e.g. TechNova Corp"
            value={form.company}
            onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
            error={errors.company}
            id="job-company"
          />
        </div>

        <TextArea
          label="Job Description"
          placeholder="Describe the role, responsibilities and expectations..."
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={4}
          error={errors.description}
          id="job-description"
        />

        {/* Experience range */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Min Experience (years)"
            type="number"
            min={0}
            value={form.minExperience}
            onChange={(e) =>
              setForm((p) => ({ ...p, minExperience: Number(e.target.value) }))
            }
            id="min-experience"
          />
          <Input
            label="Max Experience (years)"
            type="number"
            min={0}
            value={form.maxExperience}
            onChange={(e) =>
              setForm((p) => ({ ...p, maxExperience: Number(e.target.value) }))
            }
            id="max-experience"
          />
        </div>

        {/* Required skills */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Required Skills
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={requiredInput}
              onChange={(e) => setRequiredInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill("requiredSkills", requiredInput, setRequiredInput);
                }
              }}
              placeholder="Type skill and press Enter"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              id="required-skill-input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addSkill("requiredSkills", requiredInput, setRequiredInput)}
              icon={<Plus className="w-3 h-3" />}
            >
              Add
            </Button>
          </div>
          {errors.requiredSkills && (
            <p className="text-xs text-red-600 mb-1">{errors.requiredSkills}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {form.requiredSkills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-3 py-1 text-xs font-medium"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSkill("requiredSkills", s)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Preferred skills */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Preferred Skills{" "}
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={preferredInput}
              onChange={(e) => setPreferredInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill("preferredSkills", preferredInput, setPreferredInput);
                }
              }}
              placeholder="Type skill and press Enter"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              id="preferred-skill-input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addSkill("preferredSkills", preferredInput, setPreferredInput)}
              icon={<Plus className="w-3 h-3" />}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.preferredSkills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-3 py-1 text-xs font-medium"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSkill("preferredSkills", s)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="md">
          Save Job Description
        </Button>
      </div>
    </form>
  );
}
