import { google } from "googleapis";
import { format } from "date-fns";
import { Shift } from "../../entities/Shift";

// Initialize Google Calendar API
const auth = new google.auth.JWT({
	email: process.env.GOOGLE_CLIENT_EMAIL,
	key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
	scopes: ["https://www.googleapis.com/auth/calendar"],
});

const calendar = google.calendar({ version: "v3", auth });

export const syncShiftWithGoogleCalendar = async (shift: Shift): Promise<string | null> => {
	try {
		const calendarId = process.env.GOOGLE_CALENDAR_ID;

		if (!calendarId) {
			console.error("Google Calendar ID not configured");
			return null;
		}

		const shiftDate = new Date(shift.date);
		const startDateTime = new Date(shiftDate);
		const [startHours, startMinutes] = shift.startTime.split(":").map(Number);
		startDateTime.setHours(startHours, startMinutes, 0);

		const endDateTime = new Date(shiftDate);
		const [endHours, endMinutes] = shift.endTime.split(":").map(Number);
		endDateTime.setHours(endHours, endMinutes, 0);

		const eventSummary = `${shift.employee.name} - ${shift.employee.type}`;
		const eventDescription = shift.note || `Shift for ${shift.employee.name}`;

		// Check if event already exists
		if (shift.googleCalendarEventId) {
			// Update existing event
			const updatedEvent = await calendar.events.update({
				calendarId,
				eventId: shift.googleCalendarEventId,
				requestBody: {
					summary: eventSummary,
					description: eventDescription,
					start: {
						dateTime: startDateTime.toISOString(),
						timeZone: "UTC",
					},
					end: {
						dateTime: endDateTime.toISOString(),
						timeZone: "UTC",
					},
				},
			});

			return updatedEvent.data.id || null;
		} else {
			// Create new event
			const newEvent = await calendar.events.insert({
				calendarId,
				requestBody: {
					summary: eventSummary,
					description: eventDescription,
					start: {
						dateTime: startDateTime.toISOString(),
						timeZone: "UTC",
					},
					end: {
						dateTime: endDateTime.toISOString(),
						timeZone: "UTC",
					},
				},
			});

			return newEvent.data.id || null;
		}
	} catch (error) {
		console.error("Error syncing with Google Calendar:", error);
		return null;
	}
};

export const deleteCalendarEvent = async (eventId: string): Promise<boolean> => {
	try {
		const calendarId = process.env.GOOGLE_CALENDAR_ID;

		if (!calendarId || !eventId) {
			return false;
		}

		await calendar.events.delete({
			calendarId,
			eventId,
		});

		return true;
	} catch (error) {
		console.error("Error deleting Google Calendar event:", error);
		return false;
	}
};

export const getCalendarEvents = async (startDate: Date, endDate: Date): Promise<any[]> => {
	try {
		const calendarId = process.env.GOOGLE_CALENDAR_ID;

		if (!calendarId) {
			return [];
		}

		const response = await calendar.events.list({
			calendarId,
			timeMin: startDate.toISOString(),
			timeMax: endDate.toISOString(),
			singleEvents: true,
			orderBy: "startTime",
		});

		return response.data.items || [];
	} catch (error) {
		console.error("Error fetching Google Calendar events:", error);
		return [];
	}
};
