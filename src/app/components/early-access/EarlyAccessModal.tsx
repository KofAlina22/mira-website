import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";

type ModalStep = "email" | "consent" | "success" | "declined";
type OpenDetail = { source: string; trigger?: HTMLElement | null; email?: string };
type EarlyAccessLead = { email: string; early_access_consent: true; source: string; created_at: string };

const OPEN_EVENT = "mira:open-early-access";

export function openEarlyAccess(source: string, trigger?: HTMLElement | null, email = "") {
  window.dispatchEvent(new CustomEvent<OpenDetail>(OPEN_EVENT, { detail: { source, trigger, email } }));
}

async function saveEarlyAccessLead(lead: EarlyAccessLead): Promise<{ ok: boolean; message?: string }> {
  const params = new URLSearchParams(window.location.search);
  const isLocalDevelopment = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("/api/early-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        ...lead,
        locale: navigator.language,
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        referrer: document.referrer || null,
      }),
    });
    const responseBody = await response.text();
    let result: { ok?: boolean; message?: string; debug?: unknown } | null = null;
    try { result = JSON.parse(responseBody) as { ok?: boolean; message?: string; debug?: unknown }; } catch { result = null; }
    if (response.ok && result?.ok === true) return { ok: true };
    if (isLocalDevelopment) {
      console.error("[MIRA] Early-access request failed.", {
        httpStatus: response.status,
        httpStatusText: response.statusText,
        responseBody,
        apiDebug: result?.debug,
      });
    }
    return { ok: false, message: "We couldn’t save your request. Please try again." };
  } catch (error) {
    if (isLocalDevelopment) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.error("[MIRA] Early-access request timed out after 8000ms.", error);
      } else {
        console.error("[MIRA] Early-access network error.", error);
      }
    }
    return { ok: false, message: "We couldn’t save your request. Please try again." };
  } finally {
    window.clearTimeout(timeout);
  }
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EarlyAccessModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>("email");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("unknown");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storageError, setStorageError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const normalizedEmail = email.trim();
  const emailValid = emailPattern.test(normalizedEmail);

  const close = () => {
    setOpen(false);
    window.setTimeout(() => restoreFocusRef.current?.focus(), 0);
  };

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<OpenDetail>).detail;
      restoreFocusRef.current = detail.trigger ?? (document.activeElement as HTMLElement | null);
      setSource(detail.source || "unknown");
      setEmail(detail.email ?? "");
      setTouched(false);
      setSaving(false);
      setStorageError("");
      setStep("email");
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      const target = step === "email" ? inputRef.current : dialogRef.current?.querySelector<HTMLElement>("button:not([disabled])");
      target?.focus();
    }, 0);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, step]);

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const submitEmail = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!emailValid) return;
    setEmail(normalizedEmail);
    setStep("consent");
  };

  const confirmConsent = async () => {
    if (saving) return;
    setSaving(true);
    setStorageError("");
    const result = await saveEarlyAccessLead({
      email: normalizedEmail,
      early_access_consent: true,
      source,
      created_at: new Date().toISOString(),
    });
    setSaving(false);
    if (result.ok) setStep("success");
    else setStorageError(result.message || "We couldn’t save your request. Please try again.");
  };

  if (!open) return null;

  const content = step === "email" ? (
    <>
      <p className="early-access-eyebrow">Early access</p>
      <h2 id="early-access-title">Be among the first to try MIRA.</h2>
      <p id="early-access-description">Enter your work email and we’ll let you know when early access becomes available.</p>
      <form onSubmit={submitEmail} noValidate>
        <label htmlFor="early-access-email">Work email</label>
        <input ref={inputRef} id="early-access-email" type="email" inputMode="email" autoComplete="email" placeholder="name@company.com" value={email} aria-invalid={touched && !emailValid} aria-describedby={touched && !emailValid ? "early-access-error" : undefined} onBlur={() => setTouched(true)} onChange={(event) => setEmail(event.target.value)} required/>
        {touched && !emailValid && <span className="early-access-error" id="early-access-error" role="alert">Enter a valid work email.</span>}
        <div className="early-access-actions"><button className="button button--primary" type="submit" disabled={!emailValid}>Continue</button><button className="button button--secondary" type="button" onClick={close}>Cancel</button></div>
      </form>
    </>
  ) : step === "consent" ? (
    <>
      <p className="early-access-eyebrow">MIRA early access</p>
      <h2 id="early-access-title">MIRA is currently in development.</h2>
      <p id="early-access-description">Would you like us to notify you when the product is ready for early access?</p>
      {storageError && <span className="early-access-error" role="alert">{storageError}</span>}
      <div className="early-access-actions"><button className="button button--primary" type="button" disabled={saving} onClick={confirmConsent}>{saving ? "Connecting…" : "Yes, notify me"}</button><button className="button button--secondary" type="button" disabled={saving} onClick={() => setStep("declined")}>Not now</button></div>
    </>
  ) : step === "success" ? (
    <><span className="early-access-state-icon"><Check size={20}/></span><h2 id="early-access-title">You’re on the early-access list.</h2><p id="early-access-description">We’ll email you when MIRA is ready to try.</p><div className="early-access-actions"><button className="button button--primary" type="button" onClick={close}>Done</button></div></>
  ) : (
    <><h2 id="early-access-title">No problem.</h2><p id="early-access-description">You can join the early-access list at any time.</p><div className="early-access-actions"><button className="button button--primary" type="button" onClick={close}>Close</button></div></>
  );

  return <div className="early-access-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><div ref={dialogRef} className="early-access-dialog" role="dialog" aria-modal="true" aria-labelledby="early-access-title" aria-describedby="early-access-description" onKeyDown={handleDialogKeyDown}><button className="early-access-close" type="button" aria-label="Close early-access dialog" onClick={close}><X size={18}/></button>{content}</div></div>;
}
