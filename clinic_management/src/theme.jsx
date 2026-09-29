import React from "react";

export const GlobalStyle = () => (
  <style>{`
    .cms-root {
      --bg: #F6FAF9;
      --surface: #FFFFFF;
      --surface-alt: #EEF6F4;
      --primary: #146B5C;
      --primary-dark: #0E4F44;
      --primary-soft: #DCEFEA;
      --accent: #D98E3F;
      --accent-soft: #FBEBD6;
      --danger: #B3524A;
      --danger-soft: #F6E3E1;
      --text: #1B2B29;
      --text-muted: #5E7572;
      --border: #DCEAE7;
      
      --pill-bp-bg: #fff3e0; --pill-bp-bd: #ffe0b2; --pill-bp-tx: #e65100;
      --pill-su-bg: #e3f2fd; --pill-su-bd: #bbdefb; --pill-su-tx: #1565c0;
      --pill-ot-bg: #fffde7; --pill-ot-bd: #fff59d; --pill-ot-tx: #f57f17;
      --pill-rf-bg: #fce4ec; --pill-rf-bd: #f8bbd0; --pill-rf-tx: #c2185b;
      --pill-in-bg: #e8f5e9; --pill-in-bd: #c8e6c9; --pill-in-tx: #2e7d32;
      --pill-co-bg: #f3e5f5; --pill-co-bd: #e1bee7; --pill-co-tx: #7b1fa2;
      --pill-tr-bg: #ffebee; --pill-tr-bd: #ffcdd2; --pill-tr-tx: #c62828;
      --pill-pr-bg: #e0f7fa; --pill-pr-bd: #b2ebf2; --pill-pr-tx: #006064;

      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
    }

    .cms-root.dark {
      --bg: #0C1210;
      --surface: #131E1B;
      --surface-alt: #182823;
      --primary: #19806C;
      --primary-dark: #20A68D;
      --primary-soft: #143029;
      --accent: #D98E3F;
      --accent-soft: #382717;
      --danger: #D65A4F;
      --danger-soft: #421D1A;
      --text: #F2F5F4;
      --text-muted: #95A9A7;
      --border: #213531;

      --pill-bp-bg: #3E1600; --pill-bp-bd: #682600; --pill-bp-tx: #FF9800;
      --pill-su-bg: #03244D; --pill-su-bd: #064082; --pill-su-tx: #64B5F6;
      --pill-ot-bg: #3B3000; --pill-ot-bd: #665200; --pill-ot-tx: #FFD54F;
      --pill-rf-bg: #40041B; --pill-rf-bd: #750731; --pill-rf-tx: #F06292;
      --pill-in-bg: #08290D; --pill-in-bd: #0F4A18; --pill-in-tx: #81C784;
      --pill-co-bg: #270533; --pill-co-bd: #4A0B61; --pill-co-tx: #BA68C8;
      --pill-tr-bg: #3E0C10; --pill-tr-bd: #7A1920; --pill-tr-tx: #E57373;
      --pill-pr-bg: #00282E; --pill-pr-bd: #004F5C; --pill-pr-tx: #4DD0E1;
    }
    .cms-root .font-display { font-family: 'Manrope', 'Inter', sans-serif; }
    .cms-root .font-mono { font-family: 'IBM Plex Mono', monospace; }
    .cms-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; }
    .cms-input {
      background: var(--surface); border: 1.5px solid var(--border); border-radius: 10px;
      padding: 8px 12px; font-size: 14px; color: var(--text); outline: none;
      transition: border-color .15s ease; width: 100%;
    }
    .cms-input:focus { border-color: var(--primary); }
    .cms-input-sm {
      background: var(--surface); border: 1.3px solid var(--primary); border-radius: 7px;
      padding: 5px 7px; font-size: 12.5px; color: var(--text); outline: none; width: 100%;
    }
    .cms-input-sm:focus { border-color: var(--primary-dark); box-shadow: 0 0 0 2px var(--primary-soft); }
    .cms-label {
      font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase;
      color: var(--text-muted); margin-bottom: 4px; display: block;
    }
    .cms-btn-primary {
      background: var(--primary); color: white; border-radius: 10px; padding: 9px 16px;
      font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;
      transition: background .15s ease; border: none; cursor: pointer;
    }
    .cms-btn-primary:hover { background: var(--primary-dark); }
    .cms-btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .cms-btn-ghost {
      background: var(--surface-alt); color: var(--primary-dark); border-radius: 10px; padding: 9px 16px;
      font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;
      border: 1px solid var(--border); cursor: pointer;
    }
    .cms-btn-ghost:hover { background: var(--primary-soft); }
    .cms-btn-danger {
      background: var(--danger-soft); color: var(--danger); border-radius: 8px; padding: 6px 10px;
      font-size: 13px; font-weight: 600; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
    }
    .cms-btn-icon { padding: 6px 8px; border-radius: 7px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .cms-nav-item {
      display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px;
      font-size: 13.5px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all .15s ease;
    }
    .cms-nav-item:hover { background: var(--surface-alt); color: var(--text); }
    .cms-nav-item.active { background: var(--primary); color: white; }
    .cms-table th {
      text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .04em;
      color: var(--text-muted); font-weight: 700; padding: 8px 8px; border-bottom: 1.5px solid var(--border); white-space: nowrap;
    }
    .cms-table td { padding: 7px 8px; font-size: 13px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .cms-table tr:last-child td { border-bottom: none; }
    .cms-table tr.cms-entry-row td { background: var(--accent-soft); vertical-align: top; padding-top: 8px; padding-bottom: 8px; }
    .cms-table tr.cms-clickable:hover td { background: var(--surface-alt); cursor: pointer; }
    .cms-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 700; }
    .cms-badge-due { background: var(--danger-soft); color: var(--danger); }
    .cms-badge-paid { background: var(--primary-soft); color: var(--primary-dark); }
    .cms-kbd {
      font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; padding: 1.5px 6px;
      border-radius: 5px; background: var(--surface-alt); color: var(--text-muted); border: 1px solid var(--border); line-height: 1.5;
    }
    .cms-nav-item.active .cms-kbd { background: rgba(255,255,255,.18); color: white; border-color: rgba(255,255,255,.3); }
    .cms-statusbar {
      background: var(--primary-dark); color: rgba(255,255,255,.92); font-size: 11px; padding: 6px 18px;
      display: flex; align-items: center; gap: 16px; flex-shrink: 0;
    }
    .cms-statusbar .cms-kbd { background: rgba(255,255,255,.14); color: white; border-color: rgba(255,255,255,.22); }
    .cms-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .cms-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
    .cms-overlay {
      position: fixed; inset: 0; background: rgba(20,30,28,.55); z-index: 100;
      display: flex; align-items: center; justify-content: center;
    }
    .cms-modal { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; max-height: 88vh; overflow-y: auto; }
    @media print {
      body * { visibility: hidden; }
      #cms-print-area, #cms-print-area * { visibility: visible; }
      #cms-print-area { position: absolute; top: 0; left: 0; width: 100%; padding: 24px; }
      .no-print { display: none !important; }
    }
  `}</style>
);
