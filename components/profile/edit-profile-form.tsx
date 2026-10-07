"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import {
  updateProfileAction,
  type ProfileFormState,
} from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCsrfToken } from "@/hooks/use-csrf";

type College = { id: string; name: string; code: string };

export function EditProfileForm({
  name,
  mobile,
  collegeId,
  colleges,
  enrollmentNumber,
  bio,
  skills,
}: {
  name: string;
  mobile: string;
  collegeId: string | null;
  colleges: College[];
  enrollmentNumber: string;
  bio: string | null;
  skills: string[];
}) {
  const [state, formAction, pending] = useActionState<
    ProfileFormState,
    FormData
  >(updateProfileAction, null);
  const [values, setValues] = useState({
    name,
    mobile,
    collegeId: collegeId ?? "",
    enrollmentNumber,
    bio: bio ?? "",
    skills: skills.join(", "),
  });
  const csrfToken = useCsrfToken();


  const update = (field: keyof typeof values, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="_csrf" value={csrfToken} />

      {state?.error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}
      {state?.success ? (
        <p role="status" className="text-sm text-primary">
          Profile updated.
        </p>
      ) : null}

      <Field
        id="edit-name"
        label="Name"
        value={values.name}
        error={state?.fieldErrors?.name}
        onChange={(v) => update("name", v)}
        disabled={pending}
      />
      <Field
        id="edit-mobile"
        label="Mobile"
        value={values.mobile}
        error={state?.fieldErrors?.mobile}
        onChange={(v) => update("mobile", v)}
        disabled={pending}
      />
      <Field
        id="edit-enrollment"
        label="Enrollment number"
        value={values.enrollmentNumber}
        error={state?.fieldErrors?.enrollmentNumber}
        onChange={(v) => update("enrollmentNumber", v)}
        disabled={pending}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-college">College</Label>
        <select
          id="edit-college"
          name="collegeId"
          value={values.collegeId}
          disabled={pending}
          onChange={(event) => update("collegeId", event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {colleges.map((college) => (
            <option key={college.id} value={college.id}>
              {college.name} ({college.code})
            </option>
          ))}
        </select>
        {state?.fieldErrors?.collegeId ? (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.collegeId}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-bio">Bio</Label>
        <Textarea
          id="edit-bio"
          name="bio"
          rows={4}
          maxLength={500}
          value={values.bio}
          disabled={pending}
          onChange={(event) => update("bio", event.target.value)}
          placeholder="Tell the community a bit about yourself…"
        />
        {state?.fieldErrors?.bio ? (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.bio}
          </p>
        ) : null}
      </div>

      <Field
        id="edit-skills"
        label="Skills (comma separated)"
        value={values.skills}
        error={state?.fieldErrors?.skills}
        onChange={(v) => update("skills", v)}
        disabled={pending}
        placeholder="React, Python, Cybersecurity"
      />

      <Button type="submit" className="sm:w-fit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save profile"
        )}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  disabled,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id === "edit-enrollment" ? "enrollmentNumber" : id.replace("edit-", "")}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
