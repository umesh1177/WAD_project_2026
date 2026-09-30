/**
 * =========================================================
 * APPOINTMENT SCHEDULING CONTROLLER
 * =========================================================
 */

import { apiFetch, todayISO, fmtDate, showToast } from './api.js';

export async function renderAppointmentsView(container) {
  let appointments = [];
  try {
    const res = await apiFetch('/appointments');
    if (res && res.data) appointments = res.data;
  } catch (e) {}

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <!-- Schedule New Appointment Card -->
      <div class="cms-card">
        <div class="cms-card-header">
          <div class="cms-card-title">Book New Appointment</div>
        </div>
        <form id="form-book-apt" style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.5fr auto; gap: 12px; align-items: end;">
          <div class="cms-form-group">
            <label class="cms-label">Patient Name *</label>
            <input type="text" id="apt-name" class="cms-input" placeholder="Patient full name" required />
          </div>
          <div class="cms-form-group">
            <label class="cms-label">Appointment Date *</label>
            <input type="date" id="apt-date" class="cms-input" value="${todayISO()}" required />
          </div>
          <div class="cms-form-group">
            <label class="cms-label">Time</label>
            <input type="time" id="apt-time" class="cms-input" value="10:00" />
          </div>
          <div class="cms-form-group">
            <label class="cms-label">Reason</label>
            <input type="text" id="apt-reason" class="cms-input" placeholder="General Checkup, Follow-up" />
          </div>
          <button type="submit" class="cms-btn cms-btn-primary" style="height: 42px;">
            <span>📅</span>
            <span>Book Slot</span>
          </button>
        </form>
      </div>

      <!-- Appointments Directory Table -->
      <div class="cms-card">
        <div class="cms-card-header">
          <div class="cms-card-title">Scheduled Appointments (${appointments.length})</div>
        </div>
        <div class="cms-table-wrapper">
          <table class="cms-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Patient Name</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="apt-table-body">
              ${
                appointments.length === 0
                  ? `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No appointments scheduled yet.</td></tr>`
                  : appointments
                      .map(
                        (a) => `
                      <tr>
                        <td class="font-mono"><b>${fmtDate(a.appointmentDate)}</b> at ${a.appointmentTime || '10:00'}</td>
                        <td><b>${a.patientName}</b></td>
                        <td>${a.reason || 'Consultation'}</td>
                        <td><span class="cms-pill ${a.status === 'completed' ? 'cms-badge-paid' : 'cms-badge-due'}">${a.status || 'scheduled'}</span></td>
                        <td>
                          <button type="button" class="cms-btn-ghost btn-complete-apt" data-id="${a._id || a.id}" style="padding: 4px 8px; font-size: 12px;">✓ Complete</button>
                        </td>
                      </tr>
                    `
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Form Submit Handler
  const form = container.querySelector('#form-book-apt');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const patientName = container.querySelector('#apt-name').value.trim();
    const appointmentDate = container.querySelector('#apt-date').value;
    const appointmentTime = container.querySelector('#apt-time').value;
    const reason = container.querySelector('#apt-reason').value.trim();

    try {
      await apiFetch('/appointments', {
        method: 'POST',
        body: { patientId: 'walk-in', patientName, appointmentDate, appointmentTime, reason },
      });
      showToast(`Appointment booked for ${patientName}`);
      renderAppointmentsView(container);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Status Action Handlers
  container.querySelectorAll('.btn-complete-apt').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      try {
        await apiFetch(`/appointments/${id}`, {
          method: 'PUT',
          body: { status: 'completed' },
        });
        showToast('Appointment marked as completed');
        renderAppointmentsView(container);
      } catch (e) {}
    });
  });
}
