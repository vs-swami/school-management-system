"use strict";

function parseDate(d) {
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}

function withinRange(dateStr, start, end) {
  if (!dateStr) return true; // include when no due_date set
  const d = parseDate(dateStr);
  if (!d) return true;
  if (start) {
    const s = parseDate(start);
    if (s && d < new Date(s.getFullYear(), s.getMonth(), s.getDate())) return false;
  }
  if (end) {
    const e = parseDate(end);
    if (e && d > new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999)) return false;
  }
  return true;
}

module.exports = () => ({
  async applicable({ student, periodStart = null, periodEnd = null }) {
    // Load student with class via enrollment
    const studentEntity = await strapi.entityService.findOne(
      "api::student.student",
      student,
      {
        populate: {
          enrollments: { populate: { class: true } },
        },
      }
    );

    if (!studentEntity) {
      throw new Error("Student not found");
    }

    const classId = studentEntity?.enrollments?.class?.id || null;

    // Build filters for fee-assignments: class or student
    const filters = { $or: [] };
    if (classId) filters.$or.push({ class: { id: { $eq: classId } } });
    filters.$or.push({ student: { id: { $eq: student } } });

    // Add date window intersection if provided
    if (periodStart || periodEnd) {
      filters.$and = [
        {
          $or: [
            { start_date: { $null: true } },
            ...(periodEnd
              ? [{ start_date: { $lte: periodEnd } }]
              : [{ start_date: { $notNull: true } }]),
          ],
        },
        {
          $or: [
            { end_date: { $null: true } },
            ...(periodStart
              ? [{ end_date: { $gte: periodStart } }]
              : [{ end_date: { $notNull: true } }]),
          ],
        },
      ];
    }

    // If there is no class and only student filter, it's fine
    if (filters.$or.length === 0) {
      // No context -> empty
      return { studentId: student, currency: "INR", lineItems: [], totalDueNow: 0, totalUpcoming: 0 };
    }

    const assignments = await strapi.entityService.findMany(
      "api::fee-assignment.fee-assignment",
      {
        filters,
        populate: {
          fee: { populate: { installments: true, type: true } },
          class: true,
          student: true,
        },
        sort: [{ priority: "asc" }, { id: "asc" }],
        publicationState: "live",
      }
    );

    const lineItems = [];
    let currency = "INR";

    for (const a of assignments) {
      const fee = a.fee;
      if (!fee) continue;
      if (fee.currency) currency = fee.currency;

      const installments = Array.isArray(fee.installments) ? fee.installments : [];

      // Filter installments by period
      const selected = (periodStart || periodEnd)
        ? installments.filter((i) => withinRange(i.due_date, periodStart, periodEnd))
        : installments; // no period => include all

      // If no installments defined, fall back to base_amount as one line item
      const items = selected.length > 0 ? selected : [{ label: fee.frequency, amount: fee.base_amount, due_date: null, index: 1 }];

      for (const inst of items) {
        lineItems.push({
          type: fee?.type?.code || fee?.type?.name || "FEE",
          feeName: fee.name,
          installment: { label: inst.label, due_date: inst.due_date, index: inst.index },
          amount: Number(inst.amount ?? fee.base_amount) || 0,
          source: {
            assignmentId: a.id,
            classId: a.class?.id || null,
            studentId: a.student?.id || null,
          },
        });
      }
    }

    // Compute totals
    const total = lineItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    return {
      studentId: student,
      currency,
      lineItems,
      totalDueNow: total,
      totalUpcoming: 0,
    };
  },
});
