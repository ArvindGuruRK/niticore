"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CheckPill, Field, Input, Textarea } from "@/components/ui/field";
import { Select } from "@/components/ui/select";

/**
 * Demo request form. Native validation (required fields, email format) runs before submit.
 * NOT CONNECTED YET: the site has no backend, so submit only prevents the page reload. Wire
 * `onSubmit` to the chosen destination (email service, CRM or scheduler) before launch.
 */
export function DemoForm({ roles, frameworks, submit }: { roles: string[]; frameworks: string[]; submit: string }) {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: send `new FormData(e.currentTarget)` to the lead destination
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Full name" htmlFor="demo-name">
          <Input id="demo-name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Work email" htmlFor="demo-email">
          <Input id="demo-email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Company" htmlFor="demo-company">
          <Input id="demo-company" name="company" autoComplete="organization" required />
        </Field>
        <Field label="Your role" htmlFor="demo-role">
          <Select id="demo-role" name="role" options={roles} placeholder="Choose a role" required />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="type-small mb-3 font-semibold text-fg">
          Frameworks you need to meet <span className="font-medium text-fg-subtle">(optional)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {frameworks.map((f) => (
            <CheckPill key={f} name="frameworks" value={f} label={f} />
          ))}
        </div>
      </fieldset>

      <Field label="Anything we should know?" htmlFor="demo-notes" optional>
        <Textarea id="demo-notes" name="notes" />
      </Field>

      <Button type="submit" size="lg" arrow className="self-start">
        {submit}
      </Button>
    </form>
  );
}
