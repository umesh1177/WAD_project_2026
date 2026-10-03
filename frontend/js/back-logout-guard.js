/**
 * =========================================================
 * BROWSER BACK-BUTTON LOGOUT CONFIRMATION GUARD
 * =========================================================
 * Intercepts the browser's Back button when a user is in a
 * workspace dashboard. Shows a confirmation modal asking if
 * they wish to log out. If confirmed, logs out and redirects
 * to the landing page; otherwise, keeps them in the workspace.
 */

(function initBackLogoutGuard() {
  // Determine relative path to landing page based on current directory depth
  const path = window.location.pathname.replace(/\\/g, '/');
  let landingUrl = 'landing.html';
  if (path.includes('/pages/admin/') || path.includes('/pages/receptionist/') || path.includes('/pages/family/') || path.includes('/pages/patients/') || path.includes('/pages/reports/') || path.includes('/pages/certificates/')) {
    landingUrl = '../../landing.html';
  } else if (path.includes('/pages/')) {
    landingUrl = '../landing.html';
  }

  // Push initial state to history stack so Back button triggers popstate
  try {
    history.pushState({ guard: 'back-logout-guard' }, document.title, window.location.href);
  } catch (e) {}

  let modalElement = null;

  function createModal() {
    let existing = document.getElementById('back-logout-confirm-modal');
    if (existing) return existing;

    const overlay = document.createElement('div');
    overlay.id = 'back-logout-confirm-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'back-logout-dialog-title');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9999999;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    `;

    overlay.innerHTML = `
      <div id="back-logout-confirm-card" style="
        background: #ffffff;
        color: #0f172a;
        width: 100%;
        max-width: 440px;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08);
        padding: 24px;
        transform: scale(0.95) translateY(8px);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        box-sizing: border-box;
      ">
        <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px;">
          <div style="
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: #fee2e2;
            color: #dc2626;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
          ">
            <i class="fa-solid fa-right-from-bracket"></i>
          </div>
          <div style="flex: 1; min-width: 0;">
            <h3 id="back-logout-dialog-title" style="margin: 0 0 6px; font-size: 17px; font-weight: 700; color: #0f172a; line-height: 1.25;">
              Confirm Sign Out
            </h3>
            <p style="margin: 0; font-size: 13.5px; color: #64748b; line-height: 1.45;">
              You pressed the browser back button. Do you want to log out of your session and return to the main landing page?
            </p>
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 22px;">
          <button type="button" id="btn-back-cancel-logout" style="
            padding: 9px 18px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            background: #ffffff;
            color: #334155;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
          ">
            Cancel (Stay Here)
          </button>
          <button type="button" id="btn-back-confirm-logout" style="
            padding: 9px 20px;
            border-radius: 8px;
            border: none;
            background: #dc2626;
            color: #ffffff;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 8px rgba(220, 38, 38, 0.25);
            transition: all 0.15s ease;
          ">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            Log Out &amp; Exit
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const cancelBtn = overlay.querySelector('#btn-back-cancel-logout');
    const confirmBtn = overlay.querySelector('#btn-back-confirm-logout');
    const card = overlay.querySelector('#back-logout-confirm-card');

    if (cancelBtn) {
      cancelBtn.addEventListener('mouseenter', () => cancelBtn.style.background = '#f1f5f9');
      cancelBtn.addEventListener('mouseleave', () => cancelBtn.style.background = '#ffffff');
      cancelBtn.addEventListener('click', closeModal);
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('mouseenter', () => confirmBtn.style.background = '#b91c1c');
      confirmBtn.addEventListener('mouseleave', () => confirmBtn.style.background = '#dc2626');
      confirmBtn.addEventListener('click', () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Logging Out...';
        try {
          localStorage.removeItem('clinic-auth-session');
          sessionStorage.clear();
        } catch (e) {}
        window.location.replace(landingUrl);
      });
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.opacity === '1') {
        closeModal();
      }
    });

    function closeModal() {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      if (card) card.style.transform = 'scale(0.95) translateY(8px)';
      try {
        history.pushState({ guard: 'back-logout-guard' }, document.title, window.location.href);
      } catch (e) {}
    }

    return overlay;
  }

  function showModal() {
    if (!modalElement) {
      modalElement = createModal();
    }
    modalElement.style.pointerEvents = 'auto';
    modalElement.style.opacity = '1';
    const card = modalElement.querySelector('#back-logout-confirm-card');
    if (card) card.style.transform = 'scale(1) translateY(0)';
  }

  window.addEventListener('popstate', function () {
    // Keep user on the page and show confirmation dialog
    try {
      history.pushState({ guard: 'back-logout-guard' }, document.title, window.location.href);
    } catch (e) {}
    showModal();
  });
})();
