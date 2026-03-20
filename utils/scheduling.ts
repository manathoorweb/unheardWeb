/**
 * SCHEDULING ENGINE UTILITIES
 */

export interface TimeSlot {
  start: Date;
  end: Date;
}

/**
 * Calculates available slots for a given day based on therapist working hours and existing appointments.
 */
export function calculateAvailableSlots(
  workingHours: { start_time: string; end_time: string } | null,
  appointments: { start_time: string; end_time: string }[],
  slotDurationMinutes: number = 60
): TimeSlot[] {
  if (!workingHours) return [];

  const slots: TimeSlot[] = [];
  
  // Parse working hours for the "today" context (or a specific date)
  const today = new Date();
  const [startH, startM] = workingHours.start_time.split(':').map(Number);
  const [endH, endM] = workingHours.end_time.split(':').map(Number);

  let currentTime = new Date(today);
  currentTime.setHours(startH, startM, 0, 0);

  const endTime = new Date(today);
  endTime.setHours(endH, endM, 0, 0);

  while (currentTime.getTime() + slotDurationMinutes * 60000 <= endTime.getTime()) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + slotDurationMinutes * 60000);

    // Check for overlaps with existing appointments
    const isOverlapping = appointments.some((apt) => {
      const aptStart = new Date(apt.start_time).getTime();
      const aptEnd = new Date(apt.end_time).getTime();
      const sStart = slotStart.getTime();
      const sEnd = slotEnd.getTime();

      return (sStart < aptEnd && sEnd > aptStart);
    });

    if (!isOverlapping) {
      slots.push({ start: slotStart, end: slotEnd });
    }

    // Move to next slot (increments by duration or 30 mins)
    currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30 min step
  }

  return slots;
}
