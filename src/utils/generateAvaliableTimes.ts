export function generateTimeSlots(
	startTime: string,
	endTime: string,
	interval: number,
): string[] {
	const slots: string[] = [];
	const current = new Date(`1970-01-01T${startTime}:00`);
	const end = new Date(`1970-01-01T${endTime}:00`);

	while (current <= end) {
		slots.push(current.toTimeString().slice(0, 5));
		current.setMinutes(current.getMinutes() + interval);
	}
	return slots;
}
