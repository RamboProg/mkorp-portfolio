"use client";

import { useActionState } from "react";
import type { CSSProperties, ReactElement } from "react";
import { sendContact, type ContactState } from "../actions/contact";
import { BrandModel } from "./brand-model";

const initialState: ContactState = { status: "idle", message: "" };

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "18px 22px",
  border: "none",
  borderRadius: 24,
  background: "#fdf8f2",
  color: "#231c17",
  font: "500 16px/1.4 var(--font-manrope), system-ui, sans-serif",
  outline: "none",
};

export function ContactForm(): ReactElement {
  const [state, formAction, pending] = useActionState(sendContact, initialState);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <input name="name" required maxLength={100} placeholder="Your name" aria-label="Your name" autoComplete="name" style={{ ...inputStyle, flex: "1 1 220px", width: "auto" }} />
        <input name="email" type="email" required maxLength={200} placeholder="Your email" aria-label="Your email" autoComplete="email" style={{ ...inputStyle, flex: "1 1 220px", width: "auto" }} />
      </div>
      <textarea name="message" required maxLength={5000} rows={5} placeholder="What do you need?" aria-label="Message" style={{ ...inputStyle, resize: "vertical" }} />
      <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
        <button
          type="submit"
          disabled={pending}
          data-cursor="Send"
          style={{ padding: "18px 28px", border: "none", borderRadius: 999, background: "#ed2020", color: "#fff", font: "700 16px var(--font-manrope), system-ui, sans-serif", opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Sending…" : "Send message"}
        </button>
        {state.status === "success" && (
          <BrandModel src="/assets/3d-models/mkorp-red-pill-mascot.glb" label="Happy red pill mascot" motion="sway" style={{ width: 72, height: 48 }} />
        )}
        <p aria-live="polite" style={{ margin: 0, fontWeight: 600, color: state.status === "error" ? "#b91515" : "#231c17" }}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
